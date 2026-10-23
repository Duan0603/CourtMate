/**
 * Simulates real online users for local/demo environments:
 *  - Opens N fake authenticated sockets to the /notifications gateway, so
 *    "Đang online" and the live admin "online-count" push reflect real activity.
 *    Each bot cycles online for SIM_ONLINE_MIN_MS–SIM_ONLINE_MAX_MS, then goes
 *    offline for SIM_OFFLINE_MIN_MS–SIM_OFFLINE_MAX_MS, repeating — so the online
 *    count drifts up and down instead of sitting flat at SIM_USERS forever.
 *  - Has each fake user randomly "browse" pages on an interval by POSTing to
 *    /analytics/page-view, so the admin "Trang được truy cập nhiều nhất" stat
 *    has real-looking data.
 *  - Registers ONE random fake user for a real, currently-open tournament every
 *    30-40s (SIM_REGISTER_GAP_MIN_MS/MAX_MS) via POST /registrations, starting 2
 *    minutes after launch (so the admin sees online users build up before the
 *    first registration notification fires). This is a single global timer, not
 *    one per bot, so registrations never burst all at once.
 *    The backend broadcasts a real notification on every new registration
 *    ("X vừa đăng ký giải Y"), so this makes that notification bell fire for real,
 *    for anyone browsing the site.
 *
 * This does NOT touch the database with fake user accounts — it signs short-lived
 * JWTs for synthetic user ids, exactly like a real login would produce, and the
 * gateway/guards only need a valid signature, not an existing DB user.
 *
 * The tournament registrations THIS CREATES ARE REAL ROWS in the `registrations`
 * collection (status PENDING) — fine for a dev/demo DB, but don't point this at
 * production data.
 *
 * Usage:
 *   node scripts/simulate-online-traffic.js
 *   SIM_USERS=15 SIM_PAGE_VIEW_INTERVAL_MS=4000 SIM_REGISTER_GAP_MIN_MS=30000 SIM_REGISTER_GAP_MAX_MS=40000 SIM_REGISTER_INITIAL_DELAY_MS=120000 node scripts/simulate-online-traffic.js
 *   SIM_ONLINE_MIN_MS=45000 SIM_ONLINE_MAX_MS=180000 SIM_OFFLINE_MIN_MS=15000 SIM_OFFLINE_MAX_MS=90000 node scripts/simulate-online-traffic.js
 *
 * Stop with Ctrl+C.
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");

const API_URL =
  process.env.SIM_API_URL || `http://localhost:${process.env.PORT || 3000}`;
const JWT_SECRET = process.env.JWT_SECRET || "courtmate-jwt-secret-2024";

const SIM_USERS = Number(process.env.SIM_USERS || 12);
const PAGE_VIEW_INTERVAL_MS = Number(
  process.env.SIM_PAGE_VIEW_INTERVAL_MS || 5000,
);
// Only ONE registration happens at a time, globally, with a random gap between
// them — not one timer per bot (which caused bursts of simultaneous registrations).
const REGISTER_GAP_MIN_MS = Number(
  process.env.SIM_REGISTER_GAP_MIN_MS || 30000,
); // 30s
const REGISTER_GAP_MAX_MS = Number(
  process.env.SIM_REGISTER_GAP_MAX_MS || 40000,
); // 40s
// Give the admin time to see "online users" build up before the first registration/notification fires.
const REGISTER_INITIAL_DELAY_MS = Number(
  process.env.SIM_REGISTER_INITIAL_DELAY_MS || 50000,
);

// Each bot cycles online/offline on random durations so the "Đang online" count
// drifts up and down over time instead of sitting flat at SIM_USERS forever.
const ONLINE_MIN_MS = Number(process.env.SIM_ONLINE_MIN_MS || 45000); // 45s
const ONLINE_MAX_MS = Number(process.env.SIM_ONLINE_MAX_MS || 180000); // 3min
const OFFLINE_MIN_MS = Number(process.env.SIM_OFFLINE_MIN_MS || 15000); // 15s
const OFFLINE_MAX_MS = Number(process.env.SIM_OFFLINE_MAX_MS || 90000); // 1.5min

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Real routes from the web app — kept in sync by hand with apps/web/src/app/**.
const ROUTES = [
  "/",
  "/tournaments",
  "/matches",
  "/coaches",
  "/coaches/register",
  "/articles",
  "/profile",
  "/chat",
  "/organizer",
  "/login",
];

// Realistic Vietnamese display names for the simulated users.
const LAST_NAMES = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Huỳnh",
  "Phan",
  "Vũ",
  "Võ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
  "Lý",
];
const MIDDLE_NAMES = [
  "Văn",
  "Hữu",
  "Đức",
  "Quốc",
  "Minh",
  "Thành",
  "Ngọc",
  "Thị",
  "Gia",
  "Trọng",
  "Thanh",
  "Khánh",
];
const FIRST_NAMES = [
  "Huy",
  "Nam",
  "Hoàng",
  "Duy",
  "Bảo",
  "Khoa",
  "Tùng",
  "Việt",
  "An",
  "Linh",
  "Trang",
  "Hương",
  "Vy",
  "Trâm",
  "Nhi",
  "Hà",
  "My",
  "Chi",
  "Phương",
  "Quỳnh",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomVietnameseName() {
  return `${randomItem(LAST_NAMES)} ${randomItem(MIDDLE_NAMES)} ${randomItem(FIRST_NAMES)}`;
}

const PHONE_PREFIXES = [
  "090",
  "091",
  "093",
  "094",
  "096",
  "097",
  "098",
  "070",
  "079",
  "086",
  "088",
  "089",
];
const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function randomPhone() {
  const suffix = String(Math.floor(1000000 + Math.random() * 9000000));
  return `${randomItem(PHONE_PREFIXES)}${suffix}`;
}

/**
 * Fetches currently-open tournaments bots can register for.
 * Public endpoint, no auth needed.
 */
async function fetchOpenTournaments() {
  try {
    const res = await fetch(`${API_URL}/registrations/tournaments`);
    if (!res.ok) return [];
    const tournaments = await res.json();
    const now = Date.now();
    return (Array.isArray(tournaments) ? tournaments : []).filter(
      (t) =>
        t.status === "OPEN" &&
        t.startDate &&
        new Date(t.startDate).getTime() > now,
    );
  } catch (err) {
    console.error("[sim] Failed to fetch tournaments:", err.message);
    return [];
  }
}

/**
 * Registers one fake user for a random open tournament. Fire-and-forget: a bot that
 * already registered (or hit a full tournament) just logs and moves on.
 */
async function registerForRandomTournament(name, token, tournaments) {
  if (tournaments.length === 0) return;
  const tournament = randomItem(tournaments);

  try {
    const res = await fetch(`${API_URL}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tournamentId: tournament._id,
        playerName: name,
        contactPhone: randomPhone(),
        skillLevel: randomItem(SKILL_LEVELS),
      }),
    });

    if (res.ok) {
      console.log(`[sim] ${name} đã đăng ký giải "${tournament.title}"`);
    } else {
      const body = await res.json().catch(() => null);
      console.log(
        `[sim] ${name} không đăng ký được giải "${tournament.title}": ${body?.message || res.status}`,
      );
    }
  } catch (err) {
    console.error(`[sim] ${name} register error:`, err.message);
  }
}

function makeToken(userId, name) {
  return jwt.sign(
    { sub: userId, email: `${userId}@sim.local`, role: "PLAYER", name },
    JWT_SECRET,
    { expiresIn: "6h" },
  );
}

async function postPageView(route) {
  try {
    const res = await fetch(`${API_URL}/analytics/page-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ route }),
    });
    if (!res.ok) {
      console.error(
        `[sim] POST /analytics/page-view returned ${res.status} for ${route}`,
      );
    }
  } catch (err) {
    console.error(
      `[sim] Failed to record page view for ${route}:`,
      err.message,
    );
  }
}

function startFakeUser(index, getTournaments) {
  const userId = `sim-user-${index}`;
  const name = randomVietnameseName();
  const token = makeToken(userId, name);
  let stopped = false;

  // Manual connect control: this bot connects/disconnects on random cycles below,
  // instead of staying permanently online, so the live count actually fluctuates.
  const socket = io(`${API_URL}/notifications`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    autoConnect: false,
  });

  const visitPage = (route) => {
    // HTTP: persists the view for the "most visited pages" aggregation.
    postPageView(route);
    // Socket: updates the live "who's online, on which page" list in the admin UI.
    socket.emit("page-view", { route });
    console.log(`[sim] ${name} (${userId}) -> ${route}`);
  };

  let pageViewInterval = null;
  let churnTimer = null;

  const startBrowsing = () => {
    visitPage(randomItem(ROUTES));
    const jitter = Math.floor(Math.random() * 2000);
    pageViewInterval = setInterval(
      () => visitPage(randomItem(ROUTES)),
      PAGE_VIEW_INTERVAL_MS + jitter,
    );
  };

  const stopBrowsing = () => {
    clearInterval(pageViewInterval);
    pageViewInterval = null;
  };

  const scheduleDisconnect = () => {
    churnTimer = setTimeout(
      () => {
        if (stopped) return;
        socket.disconnect();
      },
      randomBetween(ONLINE_MIN_MS, ONLINE_MAX_MS),
    );
  };

  const scheduleReconnect = () => {
    churnTimer = setTimeout(
      () => {
        if (stopped) return;
        socket.connect();
      },
      randomBetween(OFFLINE_MIN_MS, OFFLINE_MAX_MS),
    );
  };

  socket.on("connect", () => {
    console.log(`[sim] ${name} (${userId}) online (socket ${socket.id})`);
    startBrowsing();
    scheduleDisconnect();
  });

  socket.on("disconnect", () => {
    if (stopped) return;
    console.log(`[sim] ${name} (${userId}) went offline`);
    stopBrowsing();
    scheduleReconnect();
  });

  socket.on("connect_error", (err) => {
    console.error(`[sim] ${name} (${userId}) connect_error:`, err.message);
  });

  socket.connect();

  return {
    name,
    token,
    stop: () => {
      stopped = true;
      stopBrowsing();
      clearTimeout(churnTimer);
      socket.disconnect();
    },
  };
}

async function main() {
  console.log(`[sim] Target backend: ${API_URL}`);
  if (!process.env.SIM_API_URL) {
    console.log(
      "[sim] WARNING: SIM_API_URL is not set — using the default (local) backend. " +
        "If the admin dashboard you are watching is served by a DEPLOYED backend " +
        "(check NEXT_PUBLIC_API_URL in apps/web/.env), the admin's browser socket and " +
        "these bot sockets live in two different processes and will never see each other. " +
        "Run with: SIM_API_URL=<your deployed backend URL> npm run simulate:online-traffic",
    );
  }
  console.log(
    `[sim] Starting ${SIM_USERS} fake online users against ${API_URL} ...`,
  );

  // Keep a shared, periodically-refreshed list of open tournaments so bots pick up
  // newly-opened tournaments without restarting the script.
  let openTournaments = await fetchOpenTournaments();
  console.log(
    `[sim] Found ${openTournaments.length} open tournament(s) bots can register for.`,
  );
  const tournamentsRefreshInterval = setInterval(async () => {
    openTournaments = await fetchOpenTournaments();
  }, 60000);

  const bots = Array.from({ length: SIM_USERS }, (_, i) =>
    startFakeUser(i + 1, () => openTournaments),
  );

  // Exactly one registration at a time, globally, spaced by a random 30-40s gap
  // (SIM_REGISTER_GAP_MIN_MS/MAX_MS) — picks a random bot identity each time,
  // independent of that bot's own online/offline churn state.
  let registerTimer = null;
  const scheduleNextRegistration = (delayMs) => {
    registerTimer = setTimeout(async () => {
      const bot = randomItem(bots);
      await registerForRandomTournament(bot.name, bot.token, openTournaments);
      scheduleNextRegistration(
        randomBetween(REGISTER_GAP_MIN_MS, REGISTER_GAP_MAX_MS),
      );
    }, delayMs);
  };
  scheduleNextRegistration(REGISTER_INITIAL_DELAY_MS);

  const shutdown = () => {
    console.log("\n[sim] Stopping fake users...");
    clearInterval(tournamentsRefreshInterval);
    clearTimeout(registerTimer);
    bots.forEach((bot) => bot.stop());
    setTimeout(() => process.exit(0), 300);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
