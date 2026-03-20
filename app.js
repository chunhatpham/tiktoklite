// =========================================
// 1. ĐĂNG KÝ SERVICE WORKER (CHO PWA)
// =========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => { 
            console.log('SW failed: ', err); 
        });
    });
}

// =========================================
// 2. BIẾN TRẠNG THÁI VÀ ĐIỀU HƯỚNG (NAVIGATION)
// =========================================
let isLoggedIn = false; // Mặc định chưa đăng nhập
const menuItems = document.querySelectorAll('.menu-item[data-target]');
const tabPages = document.querySelectorAll('.tab-page');

function activateTab(tabId) {
    // Đổi theme sáng (trắng) cho thanh menu nếu không ở trang chủ (Home nền đen)
    const bottomMenu = document.querySelector('.bottom-menu');
    if (tabId !== 'home-tab') {
        bottomMenu.classList.add('light-theme');
    } else {
        bottomMenu.classList.remove('light-theme');
    }

    // Tắt các tab cũ
    menuItems.forEach(i => i.classList.remove('active'));
    tabPages.forEach(t => t.classList.remove('active'));
    
    // Bật tab mới
    const currentMenu = document.querySelector(`.menu-item[data-target="${tabId}"]`);
    if (currentMenu) currentMenu.classList.add('active');
    
    const currentTab = document.getElementById(tabId);
    if (currentTab) currentTab.classList.add('active');
}

// Xử lý khi bấm thanh menu ở dưới
menuItems.forEach(item => {
    item.addEventListener('click', () => { 
        const targetId = item.getAttribute('data-target');
        
        // NẾU CHƯA ĐĂNG NHẬP MÀ BẤM TAB KHÁC -> CHẶN VÀ ĐẨY VỀ HỒ SƠ ĐỂ ĐĂNG KÝ
        if (!isLoggedIn && targetId !== 'profile-tab') {
            activateTab('profile-tab');
            showToast("Vui lòng đăng ký hoặc đăng nhập để tiếp tục.");
            return;
        }

        activateTab(targetId); 
    });
});

// Nút Đăng video (dấu cộng)
document.querySelector('.upload-btn').addEventListener('click', () => {
    if (!isLoggedIn) {
        activateTab('profile-tab');
        showToast("Vui lòng đăng ký hoặc đăng nhập để tiếp tục.");
        return;
    }
    alert("Chức năng mở camera tải video sẽ được gọi ở đây!");
});

// TỰ ĐỘNG CHUYỂN SANG TRANG HỒ SƠ SAU 1 GIÂY MỞ APP (NẾU CHƯA ĐĂNG NHẬP)
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!isLoggedIn) {
            activateTab('profile-tab');
        }
    }, 1000);
});

// Nút X đóng màn hình đăng ký (Chỉ cho phép đóng nếu đã đăng nhập)
document.querySelector('.auth-close').addEventListener('click', () => {
    if(!isLoggedIn) {
        showToast("Vui lòng hoàn thành đăng ký để sử dụng ứng dụng.");
        return; 
    }
    
    // Nếu đã đăng nhập mà lỡ mở lại màn đăng ký thì cho phép đóng
    document.querySelectorAll('.auth-step').forEach(step => step.classList.remove('active'));
    document.getElementById('auth-step-1').classList.add('active');
    document.querySelector('.auth-header').style.display = 'flex'; 
    activateTab('home-tab');
});

// =========================================
// 3. THÔNG BÁO NỔI (TOAST NOTIFICATION)
// =========================================
const toastNotification = document.getElementById('toastNotification');
let toastTimeout;

function showToast(message) {
    toastNotification.innerText = message;
    toastNotification.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { 
        toastNotification.classList.remove('show'); 
    }, 3000);
}

// Báo lỗi khi bấm mạng xã hội
document.querySelectorAll('.social-trigger').forEach(btn => {
    btn.addEventListener('click', () => { 
        showToast("Bạn chưa liên kết tài khoản vui lòng đăng kí bằng số điện thoại trên."); 
    });
});

// Báo lỗi khi bấm "Đăng nhập" màu đỏ
const loginLink = document.querySelector('.login-link');
if (loginLink) {
    loginLink.addEventListener('click', () => { 
        showToast("Chưa thể đăng nhập vui lòng đăng kí tài khoản."); 
    });
}

// =========================================
// 4. LUỒNG ĐĂNG KÝ (SĐT -> NGÀY SINH -> MẬT KHẨU -> MÃ GIỚI THIỆU)
// =========================================
const authStep1 = document.getElementById('auth-step-1');
const authStepDob = document.getElementById('auth-step-dob');
const authStepPassword = document.getElementById('auth-step-password');
const authStepReferral = document.getElementById('auth-step-referral');

// --- BƯỚC 1: SĐT ---
const btnContinuePhone = document.getElementById('btnContinuePhone');
btnContinuePhone.addEventListener('click', () => {
    const phoneInput = document.getElementById('phoneNumberInput').value;
    if(phoneInput.length < 8) { 
        showToast("Vui lòng nhập số điện thoại hợp lệ!"); 
        return; 
    }
    authStep1.classList.remove('active');
    authStepDob.classList.add('active');
    document.getElementById('inputDay').focus();
});

// --- BƯỚC 2: NGÀY SINH ---
const inputDay = document.getElementById('inputDay');
const inputMonth = document.getElementById('inputMonth');
const inputYear = document.getElementById('inputYear');
const btnContinueDob = document.getElementById('btnContinueDob');

function checkDobValid() {
    const d = parseInt(inputDay.value);
    const m = parseInt(inputMonth.value);
    const y = parseInt(inputYear.value);
    
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= new Date().getFullYear()) {
        btnContinueDob.classList.remove('btn-disabled'); 
    } else {
        btnContinueDob.classList.add('btn-disabled');
    }
}

inputDay.addEventListener('input', (e) => { if(e.target.value.length >= 2) inputMonth.focus(); checkDobValid(); });
inputMonth.addEventListener('input', (e) => { if(e.target.value.length >= 2) inputYear.focus(); checkDobValid(); });
inputYear.addEventListener('input', checkDobValid);

btnContinueDob.addEventListener('click', () => { 
    authStepDob.classList.remove('active'); 
    authStepPassword.classList.add('active'); 
    document.getElementById('inputPassword').focus(); 
});

// --- BƯỚC 3: MẬT KHẨU ---
const inputPassword = document.getElementById('inputPassword');
const togglePassword = document.getElementById('togglePassword');
const condLength = document.getElementById('cond-length');
const condChars = document.getElementById('cond-chars');
const btnContinuePassword = document.getElementById('btnContinuePassword');

togglePassword.addEventListener('click', () => { 
    const type = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password'; 
    inputPassword.setAttribute('type', type); 
    togglePassword.className = type === 'password' ? 'fas fa-eye-slash' : 'fas fa-eye'; 
});

inputPassword.addEventListener('input', (e) => {
    const val = e.target.value;
    
    const isLengthValid = val.length >= 8 && val.length <= 20;
    if (isLengthValid) condLength.classList.add('valid'); 
    else condLength.classList.remove('valid');
    
    const isCharsValid = /[a-zA-Z]/.test(val) && /[0-9]/.test(val) && /[^a-zA-Z0-9]/.test(val);
    if (isCharsValid) condChars.classList.add('valid'); 
    else condChars.classList.remove('valid');
    
    if (isLengthValid && isCharsValid) btnContinuePassword.classList.remove('btn-disabled'); 
    else btnContinuePassword.classList.add('btn-disabled');
});

btnContinuePassword.addEventListener('click', () => { 
    authStepPassword.classList.remove('active'); 
    document.querySelector('.auth-header').style.display = 'none'; // Ẩn header gốc đi
    authStepReferral.classList.add('active'); 
    document.getElementById('inputReferral').focus(); 
});

// --- BƯỚC 4: MÃ GIỚI THIỆU & LOGIC MỞ KHÓA APP ---
const validCodes = [
    "FGYB65RT", "NHBVCX43", "TGY67HNM", "MNJKL89P", "GFD56SAD",
    "TYUI345G", "HJKL90NM", "BVCX78FG", "RTYU65GH", "CVBN90LK"
];

const inputReferral = document.getElementById('inputReferral');
const btnFinishReferral = document.getElementById('btnFinishReferral');
const referralInputGroup = document.getElementById('referralInputGroup');
const clearReferral = document.getElementById('clearReferral');
const backToPassword = document.getElementById('backToPassword');

inputReferral.addEventListener('input', () => {
    referralInputGroup.classList.remove('error');
    const val = inputReferral.value.trim();
    
    if(val.length > 0) clearReferral.style.display = 'block'; 
    else clearReferral.style.display = 'none';
    
    // Nút xác nhận sáng lên khi nhập đủ 8 ký tự
    if(val.length >= 8) btnFinishReferral.classList.remove('btn-disabled'); 
    else btnFinishReferral.classList.add('btn-disabled');
});

clearReferral.addEventListener('click', () => { 
    inputReferral.value = ''; 
    clearReferral.style.display = 'none'; 
    referralInputGroup.classList.remove('error'); 
    btnFinishReferral.classList.add('btn-disabled'); 
    inputReferral.focus(); 
});

backToPassword.addEventListener('click', () => { 
    authStepReferral.classList.remove('active'); 
    document.querySelector('.auth-header').style.display = 'flex'; 
    authStepPassword.classList.add('active'); 
});

// XÁC NHẬN MÃ GIỚI THIỆU
btnFinishReferral.addEventListener('click', () => {
    const code = inputReferral.value.trim().toUpperCase();
    
    if (validCodes.includes(code)) {
        referralInputGroup.classList.remove('error');
        showToast("Đăng ký thành công! Chào mừng bạn.");
        
        // MỞ KHÓA TOÀN BỘ ỨNG DỤNG
        isLoggedIn = true; 
        
        // Đợi 1 giây, ẩn màn hình đăng ký và hiện bảng điều khiển Hồ sơ
        setTimeout(() => {
            document.getElementById('authModalContainer').style.display = 'none';
            const profileDashboard = document.getElementById('profile-logged-in');
            if (profileDashboard) {
                profileDashboard.style.display = 'block';
            }
        }, 1000);
    } else {
        referralInputGroup.classList.add('error');
    }
});


// =========================================
// 5. MODAL CHỌN QUỐC GIA (FULL DATA & SEARCH)
// =========================================
const countriesData = [
    { name: "Ả Rập Saudi", code: "+966" }, { name: "Afghanistan", code: "+93" }, { name: "Ai Cập", code: "+20" },
    { name: "Albania", code: "+355" }, { name: "Algeria", code: "+213" }, { name: "Andorra", code: "+376" },
    { name: "Angola", code: "+244" }, { name: "Anguilla", code: "+1264" }, { name: "Antigua và Barbuda", code: "+1268" },
    { name: "Áo", code: "+43" }, { name: "Argentina", code: "+54" }, { name: "Armenia", code: "+374" },
    { name: "Aruba", code: "+297" }, { name: "Azerbaijan", code: "+994" }, { name: "Ấn Độ", code: "+91" },
    { name: "Ba Lan", code: "+48" }, { name: "Bahamas", code: "+1242" }, { name: "Bahrain", code: "+973" },
    { name: "Bangladesh", code: "+880" }, { name: "Barbados", code: "+1246" }, { name: "Belarus", code: "+375" },
    { name: "Bỉ", code: "+32" }, { name: "Bolivia", code: "+591" }, { name: "Bồ Đào Nha", code: "+351" },
    { name: "Brazil", code: "+55" }, { name: "Brunei", code: "+673" }, { name: "Bulgaria", code: "+359" },
    { name: "Campuchia", code: "+855" }, { name: "Canada", code: "+1" }, { name: "Chile", code: "+56" },
    { name: "Colombia", code: "+57" }, { name: "Croatia", code: "+385" }, { name: "Cuba", code: "+53" },
    { name: "Đài Loan", code: "+886" }, { name: "Đan Mạch", code: "+45" }, { name: "Đức", code: "+49" },
    { name: "Ecuador", code: "+593" }, { name: "El Salvador", code: "+503" }, { name: "Estonia", code: "+372" },
    { name: "Fiji", code: "+679" }, { name: "Gabon", code: "+241" }, { name: "Georgia", code: "+995" },
    { name: "Hà Lan", code: "+31" }, { name: "Haiti", code: "+509" }, { name: "Hàn Quốc", code: "+82" },
    { name: "Hoa Kỳ", code: "+1" }, { name: "Honduras", code: "+504" }, { name: "Hungary", code: "+36" },
    { name: "Hy Lạp", code: "+30" }, { name: "Iceland", code: "+354" }, { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" }, { name: "Iraq", code: "+964" }, { name: "Ireland", code: "+353" },
    { name: "Israel", code: "+972" }, { name: "Jamaica", code: "+1876" }, { name: "Jordan", code: "+962" },
    { name: "Kazakhstan", code: "+7" }, { name: "Kenya", code: "+254" }, { name: "Kuwait", code: "+965" },
    { name: "Lào", code: "+856" }, { name: "Latvia", code: "+371" }, { name: "Lebanon", code: "+961" },
    { name: "Libya", code: "+218" }, { name: "Lithuania", code: "+370" }, { name: "Luxembourg", code: "+352" },
    { name: "Ma-rốc", code: "+212" }, { name: "Malaysia", code: "+60" }, { name: "Maldives", code: "+960" },
    { name: "Mexico", code: "+52" }, { name: "Mông Cổ", code: "+976" }, { name: "Myanmar", code: "+95" },
    { name: "Na Uy", code: "+47" }, { name: "Nam Phi", code: "+27" }, { name: "Nepal", code: "+977" },
    { name: "Nga", code: "+7" }, { name: "Nhật Bản", code: "+81" }, { name: "New Zealand", code: "+64" },
    { name: "Oman", code: "+968" }, { name: "Pakistan", code: "+92" }, { name: "Palestine", code: "+970" },
    { name: "Panama", code: "+507" }, { name: "Paraguay", code: "+595" }, { name: "Peru", code: "+51" },
    { name: "Pháp", code: "+33" }, { name: "Phần Lan", code: "+358" }, { name: "Philippines", code: "+63" },
    { name: "Qatar", code: "+974" }, { name: "Romania", code: "+40" }, { name: "Rwanda", code: "+250" },
    { name: "Séc", code: "+420" }, { name: "Senegal", code: "+221" }, { name: "Serbia", code: "+381" },
    { name: "Singapore", code: "+65" }, { name: "Slovakia", code: "+421" }, { name: "Tây Ban Nha", code: "+34" },
    { name: "Thái Lan", code: "+66" }, { name: "Thổ Nhĩ Kỳ", code: "+90" }, { name: "Thụy Điển", code: "+46" },
    { name: "Thụy Sĩ", code: "+41" }, { name: "Triều Tiên", code: "+850" }, { name: "Trung Quốc", code: "+86" },
    { name: "Ukraina", code: "+380" }, { name: "Uruguay", code: "+598" }, { name: "Úc", code: "+61" },
    { name: "Uzbekistan", code: "+998" }, { name: "Venezuela", code: "+58" }, { name: "Việt Nam", code: "+84" },
    { name: "Ý", code: "+39" }, { name: "Yemen", code: "+967" }, { name: "Zimbabwe", code: "+263" }
];

function removeAccents(str) { 
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D'); 
}

const openCountryModalBtn = document.getElementById('openCountryModal');
const closeCountryModalBtn = document.getElementById('closeCountryModal');
const countryModal = document.getElementById('countryModal');
const countryListEl = document.getElementById('countryList');
const alphabetIndexEl = document.getElementById('alphabetIndex');
const searchInput = document.getElementById('countrySearch');
const selectedCountryText = document.getElementById('selectedCountryCode');

openCountryModalBtn.addEventListener('click', () => { 
    countryModal.classList.add('active'); 
    renderCountries(countriesData); 
    searchInput.value = ''; 
});

closeCountryModalBtn.addEventListener('click', () => { 
    countryModal.classList.remove('active'); 
});

function renderCountries(data) {
    countryListEl.innerHTML = ''; 
    alphabetIndexEl.innerHTML = '';
    
    data.sort((a, b) => removeAccents(a.name).localeCompare(removeAccents(b.name)));
    
    let currentLetter = ''; 
    const lettersRendered = [];
    
    data.forEach(country => {
        let firstLetter = removeAccents(country.name).charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter; 
            lettersRendered.push(currentLetter);
            
            const groupHeader = document.createElement('div'); 
            groupHeader.className = 'letter-group-title'; 
            groupHeader.id = `group-${currentLetter}`; 
            groupHeader.innerText = currentLetter; 
            countryListEl.appendChild(groupHeader);
        }
        
        const item = document.createElement('div'); 
        item.className = 'country-item'; 
        item.innerHTML = `<span class="country-name">${country.name}</span><span class="country-dial-code">${country.code}</span>`;
        
        item.addEventListener('click', () => {
            let shortName = country.name;
            if(country.name === "Việt Nam") shortName = "VN";
            else if(country.name === "Hoa Kỳ") shortName = "US";
            else shortName = removeAccents(country.name).substring(0, 2).toUpperCase();
            
            selectedCountryText.innerText = `${shortName} ${country.code}`; 
            countryModal.classList.remove('active');
        });
        
        countryListEl.appendChild(item);
    });
    
    lettersRendered.forEach(letter => { 
        const letterSpan = document.createElement('span'); 
        letterSpan.innerText = letter; 
        letterSpan.addEventListener('click', () => { 
            const targetGroup = document.getElementById(`group-${letter}`); 
            if (targetGroup) targetGroup.scrollIntoView({ behavior: 'smooth' }); 
        }); 
        alphabetIndexEl.appendChild(letterSpan); 
    });
}

searchInput.addEventListener('input', (e) => { 
    const term = removeAccents(e.target.value.toLowerCase()); 
    const filtered = countriesData.filter(country => 
        removeAccents(country.name.toLowerCase()).includes(term) || country.code.includes(term)
    ); 
    renderCountries(filtered); 
});
