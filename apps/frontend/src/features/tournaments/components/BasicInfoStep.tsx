import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  Image, Alert, StyleSheet, TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SportType } from '@courtmate/shared';
import { ChevronDown, Calendar, MapPin, X, Check } from 'lucide-react-native';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = '#00102F';
const BLUE   = '#0077FF';
const MUTED  = '#52627A';
const BORDER = 'rgba(0,16,47,0.12)';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CITIES = [
  'Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh', 'Huế', 'Hội An',
  'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Khánh Hòa', 'Đắk Lắk',
];

const VENUES_BY_CITY: Record<string, string[]> = {
  'Đà Nẵng': [
    'Khu thể thao Tuyên Sơn',
    'Cung Thể thao Tiên Sơn',
    'Nhà thi đấu Phan Châu Trinh',
    'Sân Pickleball Sơn Trà',
    'Cụm sân Tennis Tuyên Sơn',
    'Sân bóng đá Chuyên Việt',
    'Nhà thi đấu quận Liên Chiểu',
    'CourtMate Arena Tuyên Sơn',
    'Cụm sân Pickleball Hòa Xuân',
  ],
  'Hà Nội': [
    'Cung thể thao Quần Ngựa',
    'Nhà thi đấu Trung tâm TDTT',
    'Sân vận động Mỹ Đình',
    'Nhà thi đấu Cầu Giấy',
  ],
  'TP. Hồ Chí Minh': [
    'Cung Văn hóa Lao động',
    'Nhà thi đấu Rạch Miễu',
    'Sân Phú Thọ',
    'Trung tâm TDTT Quận 1',
  ],
  'Huế': ['Trung tâm Văn hóa - Thể thao Huế', 'Sân Vận động Tự Do'],
  'Hội An': ['Sân thể thao Hội An', 'Nhà thi đấu đa năng Hội An'],
};

const SPORT_LABELS: Record<string, string> = {
  PICKLEBALL: '🏓 Pickleball',
  BADMINTON: '🏸 Cầu lông',
  TENNIS: '🎾 Tennis',
  FOOTBALL: '⚽ Bóng đá',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtDate(d: Date) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; }

// ─── Generic list picker ──────────────────────────────────────────────────────
function ListPickerModal({
  visible, title, options, value, onSelect, onClose,
}: {
  visible: boolean; title: string; options: string[];
  value: string; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.bottomSheet}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.sheetClose}>
            <X color={MUTED} size={22} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => { onSelect(opt); onClose(); }}
              style={[s.optionRow, opt === value && s.optionRowActive]}
            >
              <Text style={[s.optionText, opt === value && s.optionTextActive]}>{opt}</Text>
              {opt === value && <Check color={BLUE} size={18} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Date picker modal ────────────────────────────────────────────────────────
function DatePickerModal({
  visible, title, value, onSelect, onClose,
}: {
  visible: boolean; title: string; value: Date;
  onSelect: (d: Date) => void; onClose: () => void;
}) {
  const [selYear, setSelYear]   = useState(value.getFullYear());
  const [selMonth, setSelMonth] = useState(value.getMonth());
  const [selDay, setSelDay]     = useState(value.getDate());

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const dayList   = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const yearList  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const handleConfirm = () => {
    const safeDay = Math.min(selDay, daysInMonth);
    onSelect(new Date(selYear, selMonth, safeDay));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.bottomSheet}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.sheetClose}>
            <X color={MUTED} size={22} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8 }}>
          {/* Day column */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.spinLabel}>Ngày</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {dayList.map(d => (
                <TouchableOpacity key={d} onPress={() => setSelDay(d)} style={s.spinItem}>
                  <Text style={[s.spinText, d === selDay && s.spinTextActive]}>{pad(d)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Month column */}
          <View style={{ flex: 2, alignItems: 'center' }}>
            <Text style={s.spinLabel}>Tháng</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity key={idx} onPress={() => setSelMonth(idx)} style={s.spinItem}>
                  <Text style={[s.spinText, idx === selMonth && s.spinTextActive, { fontSize: 13 }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Year column */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.spinLabel}>Năm</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {yearList.map(y => (
                <TouchableOpacity key={y} onPress={() => setSelYear(y)} style={s.spinItem}>
                  <Text style={[s.spinText, y === selYear && s.spinTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
          <Text style={s.confirmBtnText}>Xác nhận — {pad(Math.min(selDay, daysInMonth))}/{pad(selMonth + 1)}/{selYear}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Selector row component ───────────────────────────────────────────────────
function SelectorRow({ label, value, placeholder, icon: Icon, onPress, disabled }: {
  label: string; value: string; placeholder: string;
  icon: typeof Calendar; onPress: () => void; disabled?: boolean;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.75}
        style={[s.selectorBtn, disabled && { opacity: 0.4 }]}
      >
        <Icon color={value ? NAVY : MUTED} size={17} />
        <Text style={[s.selectorText, !value && { color: MUTED }]} numberOfLines={1}>
          {'  '}{value || placeholder}
        </Text>
        <ChevronDown color={MUTED} size={17} />
      </TouchableOpacity>
    </View>
  );
}

// ─── BasicInfoStep ────────────────────────────────────────────────────────────
interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const [showStart, setShowStart]   = useState(false);
  const [showEnd, setShowEnd]       = useState(false);
  const [showCity, setShowCity]     = useState(false);
  const [showVenue, setShowVenue]   = useState(false);

  const today = new Date();
  const startDate: Date = data.startDate instanceof Date ? data.startDate : new Date(Date.now() + 7 * 86400000);
  const endDate: Date   = data.endDate   instanceof Date ? data.endDate   : new Date(startDate.getTime() + 2 * 86400000);
  const city: string    = data.city || '';
  const location: string = data.location || '';
  const venues = VENUES_BY_CITY[city] || [];

  const isValid = !!(data.title && data.description && data.sport && data.startDate && data.endDate && city && location);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
      <Text style={s.stepTitle}>Thông tin cơ bản</Text>

      {/* ── Banner ── */}
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>Ảnh bìa giải đấu</Text>
        {data.bannerFile?.uri && (
          <Image source={{ uri: data.bannerFile.uri }} style={s.bannerPreview} resizeMode="cover" />
        )}
        <TouchableOpacity style={s.bannerBtn} onPress={async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Cần quyền truy cập ảnh');
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85, allowsEditing: true, aspect: [16, 9],
          });
          if (res.canceled) return;
          const asset = res.assets[0];
          if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024)
            return Alert.alert('Ảnh quá lớn', 'Tối đa 8MB.');
          updateData({ bannerFile: { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType, file: (asset as any).file } });
        }}>
          <Text style={s.bannerBtnText}>{data.bannerFile ? '🔄 Đổi ảnh bìa' : '📷 Chọn ảnh bìa (JPG/PNG/WebP, tối đa 8MB)'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tên giải đấu ── */}
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>Tên giải đấu *</Text>
        <TextInput
          style={s.textField}
          value={data.title}
          onChangeText={t => updateData({ title: t })}
          placeholder="Nhập tên giải đấu"
          placeholderTextColor={MUTED}
        />
      </View>

      {/* ── Mô tả ── */}
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>Mô tả ngắn *</Text>
        <TextInput
          style={[s.textField, { height: 88, textAlignVertical: 'top', paddingTop: 12 }]}
          value={data.description}
          onChangeText={t => updateData({ description: t })}
          placeholder="Mô tả về giải đấu, đối tượng tham gia..."
          placeholderTextColor={MUTED}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* ── Môn thể thao ── */}
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>Môn thể thao *</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {Object.values(SportType).map(sport => (
            <TouchableOpacity
              key={sport}
              onPress={() => updateData({ sport })}
              style={[s.sportChip, data.sport === sport && s.sportChipActive]}
            >
              <Text style={[s.sportChipText, data.sport === sport && s.sportChipTextActive]}>
                {SPORT_LABELS[sport] || sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Ngày ── */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <SelectorRow
            label="Ngày bắt đầu *"
            value={data.startDate ? fmtDate(startDate) : ''}
            placeholder="Chọn ngày"
            icon={Calendar}
            onPress={() => setShowStart(true)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SelectorRow
            label="Ngày kết thúc *"
            value={data.endDate ? fmtDate(endDate) : ''}
            placeholder="Chọn ngày"
            icon={Calendar}
            onPress={() => setShowEnd(true)}
          />
        </View>
      </View>

      {/* ── Thành phố ── */}
      <SelectorRow
        label="Khu vực (Thành phố) *"
        value={city}
        placeholder="Chọn thành phố..."
        icon={MapPin}
        onPress={() => setShowCity(true)}
      />

      {/* ── Địa điểm / Sân ── */}
      <SelectorRow
        label="Địa điểm thi đấu *"
        value={location}
        placeholder={city ? 'Chọn sân thi đấu...' : 'Chọn thành phố trước'}
        icon={MapPin}
        onPress={() => setShowVenue(true)}
        disabled={!city}
      />

      {/* ── Phí & Giới hạn ── */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, ...s.fieldWrap }}>
          <Text style={s.fieldLabel}>Lệ phí tổng (VNĐ)</Text>
          <TextInput
            style={s.textField}
            value={data.registrationFee || ''}
            onChangeText={t => updateData({ registrationFee: t })}
            placeholder="Ví dụ: 200000"
            placeholderTextColor={MUTED}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1, ...s.fieldWrap }}>
          <Text style={s.fieldLabel}>Giới hạn suất</Text>
          <TextInput
            style={s.textField}
            value={data.slotsLimit || ''}
            onChangeText={t => updateData({ slotsLimit: t })}
            placeholder="Ví dụ: 32"
            placeholderTextColor={MUTED}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* ── Nút tiếp tục ── */}
      <TouchableOpacity onPress={onNext} disabled={!isValid} style={[s.continueBtn, !isValid && { opacity: 0.4 }]}>
        <Text style={s.continueBtnText}>Tiếp tục →</Text>
      </TouchableOpacity>

      {/* ── Modals ── */}
      <DatePickerModal
        visible={showStart}
        title="Ngày bắt đầu"
        value={startDate}
        onSelect={d => {
          const newEnd = new Date(d.getTime() + 2 * 86400000);
          updateData({ startDate: d, endDate: !data.endDate || d >= endDate ? newEnd : endDate });
        }}
        onClose={() => setShowStart(false)}
      />
      <DatePickerModal
        visible={showEnd}
        title="Ngày kết thúc"
        value={endDate}
        onSelect={d => updateData({ endDate: d })}
        onClose={() => setShowEnd(false)}
      />
      <ListPickerModal
        visible={showCity}
        title="Chọn thành phố"
        options={CITIES}
        value={city}
        onSelect={v => updateData({ city: v, location: '' })}
        onClose={() => setShowCity(false)}
      />
      <ListPickerModal
        visible={showVenue}
        title={`Chọn sân tại ${city}`}
        options={venues}
        value={location}
        onSelect={v => updateData({ location: v })}
        onClose={() => setShowVenue(false)}
      />
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  stepTitle: { color: NAVY, fontSize: 20, fontWeight: '700', marginBottom: 20 },

  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: NAVY, fontSize: 13, fontWeight: '600', marginBottom: 6 },

  textField: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, color: NAVY, fontSize: 15,
  },

  selectorBtn: {
    flexDirection: 'row', alignItems: 'center',
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14,
  },
  selectorText: { flex: 1, color: NAVY, fontSize: 15 },

  bannerPreview: { width: '100%', height: 160, borderRadius: 12, marginBottom: 8 },
  bannerBtn: {
    height: 52, borderRadius: 12, backgroundColor: '#F1F6FD',
    borderWidth: 1.5, borderColor: BLUE + '50', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerBtnText: { color: BLUE, fontSize: 14, fontWeight: '600' },

  sportChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER,
  },
  sportChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  sportChipText: { color: NAVY, fontSize: 13, fontWeight: '600' },
  sportChipTextActive: { color: '#FFFFFF' },

  continueBtn: { height: 52, borderRadius: 14, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,16,47,0.48)' },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32,
  },
  sheetHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: BORDER, alignSelf: 'center', marginTop: 10 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sheetTitle: { color: NAVY, fontSize: 17, fontWeight: '700' },
  sheetClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  optionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  optionRowActive: { backgroundColor: BLUE + '0A' },
  optionText: { color: NAVY, fontSize: 15 },
  optionTextActive: { color: BLUE, fontWeight: '700' },

  spinLabel: { color: MUTED, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  spinItem: { paddingVertical: 10, alignItems: 'center' },
  spinText: { color: MUTED, fontSize: 15 },
  spinTextActive: { color: BLUE, fontWeight: '700', fontSize: 17 },

  confirmBtn: { margin: 16, height: 52, borderRadius: 14, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
