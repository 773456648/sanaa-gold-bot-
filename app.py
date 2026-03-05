from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

# هنا كودك الإمبراطوري حق فادي بدون أي تغيير
 <!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👑 FADI WORKFORCE - نظام الشركات والموظفين</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: radial-gradient(circle at 30% 10%, #1a1a2e, #0f0f1f);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }

        /* البطاقة الرئيسية */
        .glass-card {
            background: rgba(20, 20, 40, 0.7);
            backdrop-filter: blur(15px);
            border: 2px solid gold;
            border-radius: 70px;
            padding: 40px;
            width: 100%;
            max-width: 1300px;
            box-shadow: 0 30px 70px rgba(255, 215, 0, 0.3);
            transition: 0.5s;
        }

        h1 {
            font-size: 3.5em;
            background: linear-gradient(145deg, gold, orange);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
            margin-bottom: 10px;
            filter: drop-shadow(0 0 20px gold);
        }

        .sub {
            color: #aaa;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.2em;
        }

        /* شاشة الدخول */
        .login-box {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 60px;
            padding: 40px;
            border: 1px solid gold;
        }

        .input-field {
            width: 100%;
            padding: 18px 25px;
            margin: 15px 0;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid gold;
            border-radius: 60px;
            color: white;
            font-size: 1.1em;
            transition: 0.3s;
        }

        .input-field:focus {
            outline: none;
            box-shadow: 0 0 30px gold;
            background: rgba(0, 0, 0, 0.7);
            border-color: orange;
        }

        .btn {
            background: linear-gradient(145deg, #2a1f4a, #1a1130);
            border: 2px solid gold;
            color: gold;
            padding: 18px 30px;
            border-radius: 60px;
            font-size: 1.3em;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            width: 100%;
            margin: 15px 0;
        }

        .btn:hover {
            background: gold;
            color: black;
            transform: translateY(-3px);
            box-shadow: 0 15px 50px gold;
        }

        /* لوحة التحكم الخاصة بالشركة */
        .company-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            background: rgba(0,0,0,0.4);
            border-radius: 60px;
            padding: 20px 30px;
            border: 1px solid gold;
        }

        .stats {
            display: flex;
            gap: 25px;
        }

        .stat-badge {
            background: rgba(255,215,0,0.1);
            border-radius: 50px;
            padding: 12px 25px;
            border: 1px solid gold;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stat-badge span {
            font-size: 1.8em;
            font-weight: bold;
            color: gold;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
        }

        .section-card {
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid gold;
            border-radius: 50px;
            padding: 25px;
        }

        .section-card h2 {
            color: gold;
            margin-bottom: 20px;
            font-size: 2em;
        }

        .list-container {
            max-height: 300px;
            overflow-y: auto;
            background: rgba(0,0,0,0.3);
            border-radius: 40px;
            padding: 15px;
        }

        .list-item {
            background: linear-gradient(145deg, #1e1a3a, #14102a);
            border: 1px solid gold;
            border-radius: 40px;
            padding: 18px 20px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .list-item .actions button {
            background: transparent;
            border: 1px solid gold;
            color: gold;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin: 0 5px;
            cursor: pointer;
            transition: 0.3s;
        }

        .list-item .actions button:hover {
            background: gold;
            color: black;
        }

        .search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .search-box input {
            flex: 1;
            padding: 15px 20px;
            border-radius: 60px;
            border: 2px solid gold;
            background: rgba(0,0,0,0.5);
            color: white;
        }

        .search-box button {
            width: auto;
            padding: 15px 30px;
        }

        .logout-btn {
            background: rgba(255,0,0,0.2);
            border: 1px solid red;
            color: red;
            padding: 12px 25px;
            border-radius: 50px;
            cursor: pointer;
        }

        .logout-btn:hover {
            background: red;
            color: white;
        }

        .footer {
            text-align: center;
            color: #aaa;
            margin-top: 30px;
            border-top: 1px dashed gold;
            padding-top: 20px;
        }

        @media (max-width: 800px) {
            .grid-2 { grid-template-columns: 1fr; }
            .stats { flex-direction: column; }
        }
    </style>
</head>
<body>

<div class="glass-card" id="appContainer">
    <!-- المحتوى يتم توليده بالجافاسكربت -->
</div>

<script>
    (function() {
        // ==================== البيانات الأساسية ====================
        // هيكل التخزين:
        // companies = { id: "companyName", password: "secret", name: "الاسم الرسمي" }
        // employees = { id (رقم تسلسلي), companyId, name, position, phone, ... }
        // leaves = { id, employeeId, companyId, date, reason, status (pending/approved/rejected) }

        // تحميل البيانات من localStorage أو تهيئتها
        let companies = JSON.parse(localStorage.getItem('fadi_companies')) || [
            { id: "tech", password: "123", name: "شركة التقنية" },
            { id: "build", password: "123", name: "شركة البناء" }
        ];
        let employees = JSON.parse(localStorage.getItem('fadi_employees')) || [
            { id: 1001, companyId: "tech", name: "أحمد محمد", position: "مطور", phone: "0551111111" },
            { id: 1002, companyId: "tech", name: "فاطمة علي", position: "محلل", phone: "0552222222" },
            { id: 2001, companyId: "build", name: "خالد إبراهيم", position: "مهندس", phone: "0561111111" }
        ];
        let leaves = JSON.parse(localStorage.getItem('fadi_leaves')) || [
            { id: 1, employeeId: 1001, companyId: "tech", date: "2026-03-10", reason: "إجازة سنوية", status: "معتمدة" },
            { id: 2, employeeId: 1002, companyId: "tech", date: "2026-03-11", reason: "مرضية", status: "معلقة" }
        ];

        // المتغيرات الجلسة
        let currentCompany = null;  // سيتم تعيينه بعد تسجيل الدخول

        // حفظ البيانات
        function saveAll() {
            localStorage.setItem('fadi_companies', JSON.stringify(companies));
            localStorage.setItem('fadi_employees', JSON.stringify(employees));
            localStorage.setItem('fadi_leaves', JSON.stringify(leaves));
        }

        // ==================== واجهات المستخدم ====================
        function renderApp() {
            const container = document.getElementById('appContainer');
            if (!currentCompany) {
                container.innerHTML = renderLogin();
            } else {
                container.innerHTML = renderDashboard();
            }
        }

        // شاشة تسجيل الدخول
        function renderLogin() {
            return `
                <div>
                    <h1>👑 FADI WORKFORCE</h1>
                    <div class="sub">منصة إدارة الشركات والموظفين المتطورة</div>
                    <div class="login-box">
                        <h2 style="color: gold; text-align: center; margin-bottom: 25px;">🔐 دخول الشركة</h2>
                        <input type="text" id="loginId" class="input-field" placeholder="اسم الشركة (مثال: tech)" value="tech">
                        <input type="password" id="loginPassword" class="input-field" placeholder="كلمة السر" value="123">
                        <button class="btn" onclick="login()">تسجيل الدخول</button>
                        <div style="text-align: center; color: #aaa; margin-top: 20px;">
                            شركة تجريبية: tech / 123
                        </div>
                    </div>
                    <div class="footer">
                        كل شركة لها عالمها الخاص وبياناتها المحفوظة
                    </div>
                </div>
            `;
        }

        // لوحة التحكم بعد الدخول
        function renderDashboard() {
            const company = companies.find(c => c.id === currentCompany);
            const companyEmployees = employees.filter(e => e.companyId === currentCompany);
            const companyLeaves = leaves.filter(l => l.companyId === currentCompany);

            return `
                <div>
                    <div class="company-header">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <h2 style="color: gold;">🏢 ${company.name}</h2>
                            <span class="stat-badge"><span>${companyEmployees.length}</span> موظف</span>
                            <span class="stat-badge"><span>${companyLeaves.length}</span> حجة</span>
                        </div>
                        <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
                    </div>

                    <!-- البحث عن موظف بالرقم التسلسلي -->
                    <div class="section-card" style="margin-bottom: 25px;">
                        <h2>🔍 البحث عن موظف بالرقم التسلسلي</h2>
                        <div class="search-box">
                            <input type="number" id="searchEmpId" placeholder="أدخل الرقم التسلسلي للموظف">
                            <button class="btn" onclick="searchEmployee()" style="width: auto;">بحث</button>
                        </div>
                        <div id="searchResult"></div>
                    </div>

                    <div class="grid-2">
                        <!-- قسم إضافة موظف -->
                        <div class="section-card">
                            <h2>➕ إضافة موظف جديد</h2>
                            <input type="text" id="empName" class="input-field" placeholder="الاسم الكامل">
                            <input type="text" id="empPosition" class="input-field" placeholder="المسمى الوظيفي">
                            <input type="text" id="empPhone" class="input-field" placeholder="رقم الهاتف">
                            <button class="btn" onclick="addEmployee()">إضافة موظف</button>
                            <div style="color: cyan; margin-top: 15px;">سيتم إنشاء رقم تسلسلي تلقائي</div>
                        </div>

                        <!-- قائمة الموظفين -->
                        <div class="section-card">
                            <h2>📋 الموظفين</h2>
                            <div class="list-container" id="employeeList">
                                ${companyEmployees.map(emp => `
                                    <div class="list-item">
                                        <div>
                                            <strong>${emp.name}</strong> - ${emp.position}<br>
                                            <small style="color:gold;">رقم: ${emp.id}</small>
                                        </div>
                                        <div class="actions">
                                            <button onclick="showAddLeaveForm(${emp.id})" title="إضافة حجة">📝</button>
                                            <button onclick="viewEmployeeLeaves(${emp.id})" title="عرض الحجج">👁️</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- حجج الخروج الأخيرة -->
                    <div class="section-card">
                        <h2>📅 آخر الحجج المسجلة</h2>
                        <div class="list-container">
                            ${companyLeaves.slice(-5).reverse().map(l => {
                                const emp = employees.find(e => e.id === l.employeeId);
                                return `
                                    <div class="list-item">
                                        <div>
                                            <strong>${emp ? emp.name : 'موظف'}</strong> - ${l.date}<br>
                                            <span style="color: ${l.status === 'معتمدة' ? '#0f0' : (l.status === 'معلقة' ? 'gold' : '#f00')};">${l.status}</span>: ${l.reason}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="footer">
                        جميع البيانات محفوظة محلياً وآمنة
                    </div>
                </div>
            `;
        }

        // ==================== العمليات ====================
        window.login = function() {
            const id = document.getElementById('loginId').value.trim();
            const pwd = document.getElementById('loginPassword').value.trim();
            const company = companies.find(c => c.id === id && c.password === pwd);
            if (company) {
                currentCompany = company.id;
                renderApp();
            } else {
                alert('اسم الشركة أو كلمة السر غير صحيحة');
            }
        };

        window.logout = function() {
            currentCompany = null;
            renderApp();
        };

        window.addEmployee = function() {
            const name = document.getElementById('empName')?.value.trim();
            const pos = document.getElementById('empPosition')?.value.trim();
            const phone = document.getElementById('empPhone')?.value.trim();
            if (!name || !pos || !phone) {
                alert('املأ جميع الحقول');
                return;
            }
            // توليد رقم تسلسلي فريد: نأخذ أكبر رقم ونضيف 1
            const maxId = employees.filter(e => e.companyId === currentCompany).reduce((max, e) => Math.max(max, e.id), 999) + 1;
            const newEmp = {
                id: maxId,
                companyId: currentCompany,
                name: name,
                position: pos,
                phone: phone
            };
            employees.push(newEmp);
            saveAll();
            renderApp();
        };

        // نافذة منبثقة لإضافة حجة
        window.showAddLeaveForm = function(empId) {
            const reason = prompt('أدخل سبب الحجة (مثال: إجازة سنوية، مرضية، مهمة رسمية):');
            if (!reason) return;
            const date = prompt('أدخل التاريخ (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
            if (!date) return;
            const newLeave = {
                id: Date.now(),
                employeeId: empId,
                companyId: currentCompany,
                date: date,
                reason: reason,
                status: 'معلقة'  // يمكن تغييرها لاحقاً
            };
            leaves.push(newLeave);
            saveAll();
            renderApp();
        };

        window.viewEmployeeLeaves = function(empId) {
            const empLeaves = leaves.filter(l => l.employeeId === empId);
            const emp = employees.find(e => e.id === empId);
            if (!emp) return;
            let msg = `حجج الموظف ${emp.name} (رقم ${empId}):\n`;
            if (empLeaves.length === 0) msg += 'لا توجد حجج مسجلة.';
            else {
                empLeaves.forEach(l => {
                    msg += `- ${l.date}: ${l.reason} (${l.status})\n`;
                });
            }
            alert(msg);
        };

        window.searchEmployee = function() {
            const searchId = parseInt(document.getElementById('searchEmpId')?.value);
            if (isNaN(searchId)) {
                alert('أدخل رقماً صحيحاً');
                return;
            }
            const emp = employees.find(e => e.id === searchId && e.companyId === currentCompany);
            const resultDiv = document.getElementById('searchResult');
            if (emp) {
                const empLeaves = leaves.filter(l => l.employeeId === emp.id);
                let html = `
                    <div style="background: gold; color: black; border-radius: 40px; padding: 20px; margin-top: 15px;">
                        <h3 style="margin-bottom: 10px;">✅ موظف موجود</h3>
                        <p><strong>الاسم:</strong> ${emp.name}</p>
                        <p><strong>الوظيفة:</strong> ${emp.position}</p>
                        <p><strong>الهاتف:</strong> ${emp.phone}</p>
                        <p><strong>عدد الحجج:</strong> ${empLeaves.length}</p>
                        <button class="btn" onclick="viewEmployeeLeaves(${emp.id})" style="margin-top: 10px;">عرض الحجج</button>
                    </div>
                `;
                resultDiv.innerHTML = html;
            } else {
                resultDiv.innerHTML = '<div style="background: #440000; border-radius: 40px; padding: 20px; color: white; margin-top: 15px;">❌ لا يوجد موظف بهذا الرقم التسلسلي في شركتك</div>';
            }
        };

        // بدء التطبيق
        window.onload = renderApp;
        saveAll(); // تأكيد حفظ البيانات الأولية
    })();
</script>
</body>
</html>
'''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
