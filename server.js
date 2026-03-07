const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ======== الملفات ========
const DATA_FILE = path.join(__dirname, 'data.json');
const LOG_FILE = path.join(__dirname, 'logs.json');

// ======== البيانات الافتراضية ========
let database = {
    owners: [],
    tenants: [],
    properties: [],
    payments: []
};

// تحميل البيانات
if (fs.existsSync(DATA_FILE)) {
    try {
        database = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {}
}

// ======== حفظ البيانات ========
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
}

// ======== تسجيل الإجراءات ========
function logAction(action, user) {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        logs = JSON.parse(fs.readFileSync(LOG_FILE));
    }
    logs.push({
        action: action,
        user: user,
        time: new Date().toLocaleString('ar-EG')
    });
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

// ======== إعدادات السيرفر ========
app.use(express.json());
app.use(express.static('public'));

// ======== التحقق من اسم مستخدم ========
app.post('/api/check-username', (req, res) => {
    const { username, type } = req.body;
    
    if (type === 'owner') {
        const exists = database.owners.some(o => o.name === username);
        res.json({ exists });
    } else {
        const exists = database.tenants.some(t => t.name === username);
        res.json({ exists });
    }
});

// ======== تسجيل مالك جديد ========
app.post('/api/register-owner', (req, res) => {
    const { name, phone, password } = req.body;
    
    if (database.owners.some(o => o.name === name)) {
        return res.json({ success: false, message: 'الاسم موجود مسبقاً' });
    }
    
    const newOwner = {
        id: database.owners.length + 1,
        name,
        phone,
        password: password || 'none',
        joinDate: new Date().toLocaleDateString('ar-EG'),
        balance: 0
    };
    
    database.owners.push(newOwner);
    saveData();
    logAction('تسجيل مالك جديد', name);
    
    res.json({ success: true, owner: newOwner });
});

// ======== تسجيل مستأجر جديد ========
app.post('/api/register-tenant', (req, res) => {
    const { name, phone, password } = req.body;
    
    if (database.tenants.some(t => t.name === name)) {
        return res.json({ success: false, message: 'الاسم موجود مسبقاً' });
    }
    
    const newTenant = {
        id: database.tenants.length + 1,
        name,
        phone,
        password: password || 'none',
        joinDate: new Date().toLocaleDateString('ar-EG'),
        totalPaid: 0,
        properties: []
    };
    
    database.tenants.push(newTenant);
    saveData();
    logAction('تسجيل مستأجر جديد', name);
    
    res.json({ success: true, tenant: newTenant });
});

// ======== إضافة عقار ========
app.post('/api/add-property', (req, res) => {
    const { name, address, type, rent, ownerName } = req.body;
    
    const newProperty = {
        id: database.properties.length + 1,
        name,
        address,
        type,
        rent: parseInt(rent),
        owner: ownerName,
        tenant: null,
        startDate: null,
        endDate: null,
        status: 'متاح'
    };
    
    database.properties.push(newProperty);
    saveData();
    logAction('إضافة عقار', ownerName);
    
    res.json({ success: true });
});

// ======== تأجير عقار ========
app.post('/api/rent-property', (req, res) => {
    const { propertyId, tenantName, months, startDate } = req.body;
    
    const property = database.properties.find(p => p.id === propertyId);
    const tenant = database.tenants.find(t => t.name === tenantName);
    
    if (!property || !tenant) {
        return res.json({ success: false });
    }
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(months));
    
    property.tenant = tenantName;
    property.startDate = startDate;
    property.endDate = endDate.toLocaleDateString('ar-EG');
    property.status = 'مؤجر';
    
    tenant.properties.push({
        propertyId,
        name: property.name,
        startDate,
        endDate: endDate.toLocaleDateString('ar-EG'),
        rent: property.rent
    });
    
    saveData();
    logAction('تأجير عقار', ownerName);
    
    res.json({ success: true });
});

// ======== دفع إيجار ========
app.post('/api/pay-rent', (req, res) => {
    const { propertyId, tenantName, amount, month } = req.body;
    
    const property = database.properties.find(p => p.id === propertyId);
    const tenant = database.tenants.find(t => t.name === tenantName);
    const owner = database.owners.find(o => o.name === property.owner);
    
    const payment = {
        id: database.payments.length + 1,
        propertyId,
        propertyName: property.name,
        tenantName,
        ownerName: property.owner,
        amount: parseInt(amount),
        month,
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG')
    };
    
    database.payments.push(payment);
    
    if (tenant) {
        tenant.totalPaid = (tenant.totalPaid || 0) + parseInt(amount);
    }
    
    if (owner) {
        owner.balance = (owner.balance || 0) + parseInt(amount);
    }
    
    saveData();
    logAction('دفع إيجار', tenantName);
    
    res.json({ success: true });
});

// ======== حذف عقار (للمالك فقط) ========
app.post('/api/delete-property', (req, res) => {
    const { propertyId, ownerName, password } = req.body;
    
    const owner = database.owners.find(o => o.name === ownerName);
    
    if (!owner || (owner.password !== 'none' && owner.password !== password)) {
        return res.json({ success: false, message: 'غير مصرح' });
    }
    
    database.properties = database.properties.filter(p => p.id !== propertyId);
    saveData();
    logAction('حذف عقار', ownerName);
    
    res.json({ success: true });
});

// ======== جلب كل البيانات ========
app.get('/api/data', (req, res) => {
    res.json({
        owners: database.owners,
        tenants: database.tenants,
        properties: database.properties,
        payments: database.payments
    });
});

app.listen(PORT, () => {
    console.log(`🚀 شغال على المنفذ ${PORT}`);
});