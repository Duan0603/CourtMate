'use client';
import React, { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, Upload, Users, Trophy, X } from 'lucide-react';
import { UserRole } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import { GoogleLoginButton } from './GoogleLoginButton';
import styles from './AuthCard.module.css';
const rules = [
  { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { label: 'Có chữ cái', test: (v: string) => /\p{L}/u.test(v) },
  { label: 'Có chữ in hoa', test: (v: string) => /\p{Lu}/u.test(v) },
  { label: 'Có số', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Có ký tự đặc biệt', test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v) },
];
const sports = [['BADMINTON','Cầu lông'],['PICKLEBALL','Pickleball'],['TENNIS','Tennis'],['FOOTBALL','Bóng đá']];
type Mode = 'login' | 'register';
export function AuthCard({ initialMode = 'login', onSuccess, destination }: { initialMode?: Mode; onSuccess?: (role?: string) => void; destination?: string }) {
  const { login, register } = useAuth();
  const router = useRouter(); const id = useId();
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(UserRole.PLAYER);
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false); const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register'; const organizer = isRegister && role === UserRole.ORGANIZER;
  const validPassword = rules.every(rule => rule.test(password));
  useEffect(() => { setMode(initialMode); setError(''); }, [initialMode]);
  useEffect(() => { if (!file) { setPreview(''); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  const switchMode = (next: Mode) => { setMode(next); setPassword(''); setConfirm(''); setVisible(false); setConfirmVisible(false); setError(''); };
  const selectFile = (next?: File) => {
    if (!next) return;
    if (!['image/jpeg','image/png','image/webp'].includes(next.type) || next.size > 5 * 1024 * 1024) { setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB.'); return; }
    setFile(next); setError('');
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return; setError('');
    if (isRegister && !validPassword) { setError('Mật khẩu chưa đáp ứng đủ các yêu cầu bên dưới.'); return; }
    if (isRegister && password !== confirm) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    if (organizer && (!file || !selectedSports.length)) { setError('Vui lòng tải giấy chứng nhận và chọn ít nhất một bộ môn.'); return; }
    setBusy(true);
    try {
      if (isRegister) {
        const certificateUrl = organizer && file ? await uploadImageToCloudinary(file) : undefined;
        await register(email.trim(), password, name.trim(), role, organizer ? { certificateUrl, sports: selectedSports } : undefined);
      } else await login(email.trim(), password);

      const stored = typeof window !== 'undefined' ? localStorage.getItem('courtmate_user') : null;
      const loggedUser = stored ? JSON.parse(stored) : null;
      const userRole = loggedUser?.role || (isRegister ? role : undefined);

      if (onSuccess) { onSuccess(userRole); return; }
      const requested = destination || new URLSearchParams(window.location.search).get('redirect');
      if (requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/\\')) router.push(requested);
      else if (userRole === UserRole.ORGANIZER) router.push('/organizer');
      else if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.REGIONAL_ADMIN) router.push('/admin');
      else if (!onSuccess) router.push('/tournaments');
    } catch (err: any) { setError(err.message || 'Không thể kết nối. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  const required = <span className={styles.required} aria-hidden="true">*</span>;
  return <div className={styles.shell}>
    <aside className={styles.intro} aria-hidden="true">
      <div className={styles.brand}><img src="/courtMate_logo.png" alt="" /> CourtMate</div>
      <div className={styles.introCopy}><div className={styles.sportMark}><Trophy size={52} strokeWidth={1.8}/></div><h2>Cùng đam mê.<br/>Cùng ra sân.</h2><p>Kết nối người chơi, khám phá giải đấu và tìm đồng đội của bạn.</p></div>
      <div className={styles.sportLabels}><span>Cầu lông</span><span>Pickleball</span><span>Tennis</span></div>
    </aside>
    <section className={styles.main}>
      <div className={styles.tabs} aria-label="Tài khoản">
        <button type="button" disabled={busy} aria-pressed={!isRegister} onClick={() => switchMode('login')}>Đăng nhập</button>
        <button type="button" disabled={busy} aria-pressed={isRegister} onClick={() => switchMode('register')}>Tạo tài khoản</button>
      </div>
      <header className={styles.heading}><h1>{isRegister ? 'Bắt đầu cùng CourtMate' : 'Chào mừng trở lại!'}</h1><p>{isRegister ? 'Một tài khoản, thật nhiều cơ hội ra sân.' : 'Đăng nhập để tiếp tục hành trình thể thao của bạn.'}</p></header>
      <form onSubmit={submit} className={styles.form}>
        <fieldset disabled={busy} className={styles.fields} data-register={isRegister} data-organizer={organizer}>
        {isRegister && <>
          <fieldset className={styles.role}><legend>Bạn tham gia với vai trò {required}</legend><div>{[{value:UserRole.PLAYER,label:'Người chơi',Icon:Users},{value:UserRole.ORGANIZER,label:'Ban tổ chức',Icon:Trophy}].map(({value,label,Icon}) => <label key={value}><input type="radio" name={id+'role'} value={value} checked={role===value} onChange={() => setRole(value)}/><span><Icon size={18}/>{label}<Check size={16} className={styles.roleCheck}/></span></label>)}</div></fieldset>
          <label className={`${styles.field} ${styles.nameField}`} htmlFor={id+'name'}>{organizer ? 'Tên ban tổ chức' : 'Họ và tên'} {required}<input id={id+'name'} required maxLength={120} autoComplete={organizer ? 'organization' : 'name'} value={name} onChange={e => setName(e.target.value)} placeholder={organizer ? 'Tên đơn vị hoặc câu lạc bộ' : 'Tên của bạn'}/></label>
          {organizer && <>
            <div className={styles.field}><label htmlFor={id+'certificate'}>Giấy chứng nhận {required}</label>
              <div className={styles.drop} data-dragging={dragging} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);if(!busy)selectFile(e.dataTransfer.files[0]);}}>
                <input id={id+'certificate'} type="file" accept="image/jpeg,image/png,image/webp" aria-required="true" aria-label="Tải giấy chứng nhận" onChange={e=>selectFile(e.target.files?.[0])}/>
                {preview ? <div className={styles.filePreview}><img src={preview} alt="Xem trước giấy chứng nhận"/><span>{file?.name}<small>Bấm hoặc kéo ảnh để thay thế</small></span></div> : <><Upload size={23}/><strong>Chọn ảnh hoặc kéo thả vào đây</strong><small>JPG, PNG, WebP · Tối đa 5 MB</small></>}
              </div>{file && <button type="button" className={styles.remove} onClick={()=>setFile(null)}><X size={14}/> Xóa ảnh</button>}
            </div>
            <fieldset className={styles.sports}><legend>Bộ môn mong muốn đăng ký {required}</legend><div>{sports.map(([value,label])=><label key={value}><input type="checkbox" checked={selectedSports.includes(value)} onChange={e=>setSelectedSports(prev=>e.target.checked?[...prev,value]:prev.filter(item=>item!==value))}/><span>{label}</span></label>)}</div></fieldset>
          </>}
        </>}
        <label className={`${styles.field} ${styles.emailField}`} htmlFor={id+'email'}>{organizer ? 'Gmail' : 'Email'} {required}<input id={id+'email'} required type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder={organizer ? 'bantochuc@gmail.com' : 'ban@example.com'}/></label>
        <div className={`${styles.field} ${styles.passwordField}`}><label htmlFor={id+'password'}>Mật khẩu {required}</label><div className={styles.password}><input id={id+'password'} required type={visible?'text':'password'} autoComplete={isRegister?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} aria-describedby={id+'rules'} placeholder={isRegister?'Tạo mật khẩu của bạn':'Nhập mật khẩu'}/><button type="button" aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></div>
        {(isRegister || password.length>0) && <div id={id+'rules'} className={styles.requirements}><p>{isRegister?'Mật khẩu cần đáp ứng:':'Tiêu chuẩn mật khẩu hiện tại:'}</p><ul>{rules.map(rule=><li key={rule.label} data-met={rule.test(password)}><span>{rule.test(password)?<Check size={12}/>:null}</span>{rule.label}<span className={styles.srOnly}>{rule.test(password)?' — đã đạt':' — chưa đạt'}</span></li>)}</ul>{!isRegister && !validPassword && <small>Tài khoản cũ vẫn có thể đăng nhập bằng mật khẩu đã thiết lập.</small>}</div>}
        {isRegister && <div className={`${styles.field} ${styles.confirmField}`}><label htmlFor={id+'confirm'}>Xác nhận mật khẩu {required}</label><div className={styles.password}><input id={id+'confirm'} required type={confirmVisible?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} aria-invalid={confirm.length>0&&confirm!==password} aria-describedby={id+'match'} placeholder="Nhập lại mật khẩu"/><button type="button" aria-label={confirmVisible?'Ẩn mật khẩu xác nhận':'Hiện mật khẩu xác nhận'} aria-pressed={confirmVisible} onClick={()=>setConfirmVisible(!confirmVisible)}>{confirmVisible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{confirm && <small id={id+'match'} className={confirm===password?styles.match:styles.required} role="status">{confirm===password?'Mật khẩu xác nhận đã khớp.':'Mật khẩu xác nhận chưa khớp.'}</small>}</div>}
        </fieldset>
        {error && <div className={styles.error} role="alert">{error}</div>}
        <button type="submit" className={styles.submit} disabled={busy}>{busy?'Đang xử lý…':isRegister?'Tạo tài khoản':'Đăng nhập'}{!busy&&<ArrowRight size={19}/>}</button>
      </form>
      {!organizer && <><div className={styles.divider}><span>hoặc tiếp tục với</span></div><GoogleLoginButton text="Tiếp tục với Google" onSuccess={onSuccess} redirectTo={destination || '/tournaments'}/></>}
      <p className={styles.note}>Các trường có dấu {required} là bắt buộc.</p>
    </section>
  </div>;
}
