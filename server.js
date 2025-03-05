const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:8081', 'http://localhost:8000', 'http://localhost:3000', 'http://localhost:19006'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Ledger Master API" });
});

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// City codes mapping
const cityMapping = {
  1: 'JAMMU & KASHMIR',
  2: 'HIMACHAL PRADESH',
  3: 'PUNJAB',
  4: 'CHANDIGARH',
  5: 'UTTARANCHAL',
  6: 'HARYANA',
  7: 'DELHI',
  8: 'RAJASTHAN',
  9: 'UTTAR PRADESH',
  10: 'BIHAR'
};

// Connect to database and initialize tables
sql.connect(config).then(async () => {
  console.log('Connected to MS SQL Server');
  
  try {
    // Create City table if it doesn't exist
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'City')
      BEGIN
        CREATE TABLE City (
          CityId INT PRIMARY KEY,
          CITY NVARCHAR(100),
          IsActive CHAR(1) DEFAULT 'Y'
        );

        -- Insert default city data
        INSERT INTO City (CityId, CITY, IsActive) VALUES
          (1, 'JAMMU & KASHMIR', 'Y'),
          (2, 'HIMACHAL PRADESH', 'Y'),
          (3, 'PUNJAB', 'Y'),
          (4, 'CHANDIGARH', 'Y'),
          (5, 'UTTARANCHAL', 'Y'),
          (6, 'HARYANA', 'Y'),
          (7, 'DELHI', 'Y'),
          (8, 'RAJASTHAN', 'Y'),
          (9, 'UTTAR PRADESH', 'Y'),
          (10, 'BIHAR', 'Y'),
          (11, 'SIKKIM', 'Y'),
          (12, 'ARUNACHAL PRADESH', 'Y'),
          (13, 'NAGALAND', 'Y'),
          (14, 'MANIPUR', 'Y'),
          (15, 'MIZORAM', 'Y'),
          (16, 'TRIPURA', 'Y'),
          (17, 'MEGHALAYA', 'Y'),
          (18, 'ASSAM', 'Y'),
          (19, 'WEST BENGAL', 'Y'),
          (20, 'JHARKHAND', 'Y'),
          (21, 'ORISSA', 'Y'),
          (22, 'CHHATTISGARH', 'Y'),
          (23, 'MADHYA PRADESH', 'Y'),
          (24, 'GUJARAT', 'Y'),
          (25, 'DAMAN & DIU', 'Y'),
          (26, 'DADRA & NAGAR HAVELI', 'Y'),
          (27, 'MAHARASHTRA', 'Y'),
          (28, 'ANDHRA PRADESH (OLD)', 'Y'),
          (29, 'KARNATAKA', 'Y'),
          (30, 'GOA', 'Y'),
          (31, 'LAKSHADWEEP', 'Y'),
          (32, 'KERALA', 'Y'),
          (33, 'TAMIL NADU', 'Y'),
          (34, 'PUDUCHERRY', 'Y'),
          (35, 'ANDAMAN & NICOBAR ISLANDS', 'Y'),
          (36, 'TELENGANA', 'Y'),
          (37, 'ANDHRA PRADESH (NEW)', 'Y');
      END
    `;
    // Create LedgerGroup table if it doesn't exist
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LedgerGroup')
      BEGIN
        CREATE TABLE LedgerGroup (
          LedgerGroupId INT PRIMARY KEY IDENTITY(1,1),
          LEDGERGROUP NVARCHAR(100),
          CompId INT
        );

        -- Insert default ledger groups
        INSERT INTO LedgerGroup (LEDGERGROUP, CompId) VALUES
          ('SUNDRY DEBTORS', 1),
          ('SUNDRY CREDITORS', 1);
      END
    `;

    // Create Supplier_Seq if it doesn't exist
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.sequences WHERE name = 'Supplier_Seq')
      BEGIN
        CREATE SEQUENCE Supplier_Seq
        START WITH 1
        INCREMENT BY 1;
      END
    `;

    // Create Supplier table if it doesn't exist
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Supplier')
      BEGIN
        CREATE TABLE Supplier (
          SupplierId INT PRIMARY KEY,
          Supplier NVARCHAR(100),
          PrintName NVARCHAR(100),
          Add1 NVARCHAR(100),
          Add2 NVARCHAR(100),
          Add3 NVARCHAR(100),
          City INT,
          Phone NVARCHAR(20),
          Fax NVARCHAR(20),
          TNGST_No NVARCHAR(50),
          TIN_No NVARCHAR(50),
          Mailid NVARCHAR(100),
          Contact_person NVARCHAR(100),
          Mobile_No NVARCHAR(20),
          Supplier_Customer CHAR(1),
          Isactive CHAR(1),
          CompId INT,
          LedgerGroupId INT,
          SupCode NVARCHAR(10),
          CreditDays INT,
          VhNo NVARCHAR(50),
          OpBalAmt DECIMAL(18,2),
          OpType NVARCHAR(10),
          OpDt DATETIME,
          LastUpdate DATETIME DEFAULT GETDATE()
        );
      END
    `;

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Create new company
app.post('/api/companies', async (req, res) => {
  try {
    const request = new sql.Request();
    
    const result = await request.query(`
      INSERT INTO Company_Store DEFAULT VALUES;
      SELECT SCOPE_IDENTITY() as CompanyId;
    `);
    
    res.status(201).json({
      message: 'Company created successfully',
      companyId: result.recordset[0].CompanyId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating company');
  }
});

// Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const result = await sql.query`SELECT CompanyId FROM Company_Store`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching companies');
  }
});

// Get active company
app.get('/api/company-store/active', async (req, res) => {
  try {
    const result = await sql.query`SELECT TOP 1 CompanyId FROM Company_Store ORDER BY CompanyId DESC`;
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'No active company found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching active company' });
  }
});

// Get all suppliers
// Get all cities
app.get('/api/cities', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT CityId, City as CITY 
      FROM City 
      WHERE IsActive = 'Y'
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).send('Error fetching cities');
  }
});

// Get ledger groups by company
app.get('/api/ledger-groups/:compId', async (req, res) => {
  try {
    const { compId } = req.params;
    
    if (!compId || isNaN(compId)) {
      return res.status(400).json({
        message: 'Invalid company ID provided'
      });
    }

    const request = new sql.Request();
    request.input('compId', sql.Int, parseInt(compId));
    
    const result = await request.query(`
      SELECT LedgerGroupId, LEDGERGROUP 
      FROM LedgerGroup 
      WHERE CompId = @compId
      ORDER BY LEDGERGROUP
    `);
    
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        message: 'No ledger groups found for this company'
      });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching ledger groups:', err);
    res.status(500).json({
      message: 'Error fetching ledger groups',
      error: err.message
    });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    // Get the company ID from the request headers or query params
    const companyId = req.query.companyId || req.headers['company-id'];
    
    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required'
      });
    }

    const request = new sql.Request();
    request.input('companyId', sql.Int, parseInt(companyId));
    
    const result = await request.query(`
      SELECT 
        SupplierId,
        Supplier,
        PrintName,
        Add1,
        Add2,
        Add3,
        City,
        Phone,
        Fax,
        TNGST_No,
        TIN_No,
        Mailid,
        Contact_person,
        Mobile_No,
        Supplier_Customer,
        Isactive,
        CompId,
        LedgerGroupId,
        SupCode,
        CreditDays,
        VhNo,
        OpBalAmt,
        OpType,
        OpDt,
        LastUpdate
      FROM Supplier WITH (NOLOCK)
      WHERE CompId = @companyId
    `);
    
    if (!result || !result.recordset) {
      throw new Error('Invalid response from database');
    }
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Detailed supplier fetch error:', err);
    res.status(500).json({
      message: 'Error fetching suppliers',
      details: err.message
    });
  }
});

// Get supplier by ID
app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, req.params.id);
    const result = await request.query('SELECT * FROM Supplier WHERE SupplierId = @id');
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching supplier' });
  }
});

// Create new supplier
app.post('/api/suppliers', async (req, res) => {
  try {
    // Validate city exists
    const cityId = req.body.City;
    const cityCheck = await sql.query`SELECT CityId FROM City WHERE CityId = ${cityId}`;
    if (cityCheck.recordset.length === 0) {
      return res.status(400).json({
        message: `Invalid city code: ${cityId}. Please select a valid city.`
      });
    }

    const request = new sql.Request();
    const {
      Supplier, PrintName, Add1, Add2, Add3, City, Phone, Fax,
      TNGST_No, TIN_No, Mailid, Contact_person, Mobile_No,
      Supplier_Customer, Isactive, CompId, LedgerGroupId,
      SupCode, CreditDays, VhNo, OpBalAmt, OpType, OpDt
    } = req.body;

    // Add input parameters
    request.input('Supplier', sql.NVarChar(100), Supplier);
    request.input('PrintName', sql.NVarChar(100), PrintName);
    request.input('Add1', sql.NVarChar(100), Add1);
    request.input('Add2', sql.NVarChar(100), Add2);
    request.input('Add3', sql.NVarChar(100), Add3);
    request.input('City', sql.Int, City);
    request.input('Phone', sql.NVarChar(20), Phone);
    request.input('Fax', sql.NVarChar(20), Fax);
    request.input('TNGST_No', sql.NVarChar(50), TNGST_No);
    request.input('TIN_No', sql.NVarChar(50), TIN_No);
    request.input('Mailid', sql.NVarChar(100), Mailid);
    request.input('Contact_person', sql.NVarChar(100), Contact_person);
    request.input('Mobile_No', sql.NVarChar(20), Mobile_No);
    request.input('Supplier_Customer', sql.Char(1), Supplier_Customer);
    request.input('Isactive', sql.Char(1), Isactive);
    request.input('CompId', sql.Int, CompId);
    request.input('LedgerGroupId', sql.Int, LedgerGroupId);
    request.input('SupCode', sql.NVarChar(10), SupCode);
    request.input('CreditDays', sql.Int, CreditDays);
    request.input('VhNo', sql.NVarChar(50), VhNo);
    request.input('OpBalAmt', sql.Decimal(18, 2), OpBalAmt);
    request.input('OpType', sql.NVarChar(10), OpType);
    request.input('OpDt', sql.DateTime, new Date(OpDt));

    const result = await request.query(`
      INSERT INTO Supplier (
        Supplier, Add1, Add2, City, Phone, Fax,
        TNGST_No, TIN_No, Mailid, Contact_person, Mobile_No,
        Supplier_Customer, Isactive, Add3, CompId, LedgerGroupId,
        PrintName, SupCode, CreditDays, VhNo, OpBalAmt, OpType, OpDt, LastUpdate
      ) VALUES (
        @Supplier, @Add1, @Add2, @City, @Phone, @Fax,
        @TNGST_No, @TIN_No, @Mailid, @Contact_person, @Mobile_No,
        @Supplier_Customer, @Isactive, @Add3, @CompId, @LedgerGroupId,
        @PrintName, @SupCode, @CreditDays, @VhNo, @OpBalAmt, @OpType, @OpDt, GETDATE()
      );
      SELECT SCOPE_IDENTITY() as SupplierId;
    `);

    res.status(201).json({
      message: 'Supplier created successfully',
      supplierId: result.recordset[0].SupplierId
    });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ 
      message: 'Error creating supplier',
      error: err.message 
    });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    
    // Query to get user data with only existing columns
    const result = await request.query(`
      SELECT Pwd, UserId, IsAllComp, RightsCompId 
      FROM Users 
      WHERE UserName = @username AND IsActive = 'Y'
    `);
    
    // Check if user exists
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid username or user is inactive' });
    }
    
    const user = result.recordset[0];
    
    // Verify password
    if (user.Pwd !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Return user information without password
    const { Pwd, ...userInfo } = user;
    
    // Get active company ID from RightsCompId
    const companyId = userInfo.RightsCompId;
    
    res.json({
      message: 'Login successful',
      user: {
        ...userInfo,
        companyId: companyId
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Error during login process',
      error: err.message 
    });
  }
});

// Update supplier
app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const companyId = req.headers['company-id'];

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required in headers'
      });
    }

    // Validate supplier exists and belongs to the company
    const checkRequest = new sql.Request();
    checkRequest.input('supplierId', sql.Int, supplierId);
    checkRequest.input('companyId', sql.Int, companyId);
    
    const checkResult = await checkRequest.query(
      'SELECT SupplierId FROM Supplier WHERE SupplierId = @supplierId AND CompId = @companyId'
    );

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        message: 'Supplier not found or does not belong to the company'
      });
    }

    // Validate city exists
    const cityId = req.body.City;
    const cityCheck = await sql.query`SELECT CityId FROM City WHERE CityId = ${cityId}`;
    if (cityCheck.recordset.length === 0) {
      return res.status(400).json({
        message: `Invalid city code: ${cityId}. Please select a valid city.`
      });
    }

    const request = new sql.Request();
    const {
      Supplier, PrintName, Add1, Add2, Add3, City, Phone, Fax,
      TNGST_No, TIN_No, Mailid, Contact_person, Mobile_No,
      Supplier_Customer, Isactive, LedgerGroupId,
      SupCode, CreditDays, VhNo, OpBalAmt, OpType
    } = req.body;

    // Add input parameters
    request.input('SupplierId', sql.Int, supplierId);
    request.input('Supplier', sql.NVarChar(100), Supplier);
    request.input('PrintName', sql.NVarChar(100), PrintName);
    request.input('Add1', sql.NVarChar(100), Add1);
    request.input('Add2', sql.NVarChar(100), Add2);
    request.input('Add3', sql.NVarChar(100), Add3);
    request.input('City', sql.Int, City);
    request.input('Phone', sql.NVarChar(20), Phone);
    request.input('Fax', sql.NVarChar(20), Fax);
    request.input('TNGST_No', sql.NVarChar(50), TNGST_No);
    request.input('TIN_No', sql.NVarChar(50), TIN_No);
    request.input('Mailid', sql.NVarChar(100), Mailid);
    request.input('Contact_person', sql.NVarChar(100), Contact_person);
    request.input('Mobile_No', sql.NVarChar(20), Mobile_No);
    request.input('Supplier_Customer', sql.Char(1), Supplier_Customer);
    request.input('Isactive', sql.Char(1), Isactive);
    request.input('LedgerGroupId', sql.Int, LedgerGroupId);
    request.input('SupCode', sql.NVarChar(10), SupCode);
    request.input('CreditDays', sql.Int, CreditDays);
    request.input('VhNo', sql.NVarChar(50), VhNo);
    request.input('OpBalAmt', sql.Decimal(18, 2), OpBalAmt);
    request.input('OpType', sql.NVarChar(10), OpType);

    await request.query(`
      UPDATE Supplier SET
        Supplier = @Supplier,
        PrintName = @PrintName,
        Add1 = @Add1,
        Add2 = @Add2,
        Add3 = @Add3,
        City = @City,
        Phone = @Phone,
        Fax = @Fax,
        TNGST_No = @TNGST_No,
        TIN_No = @TIN_No,
        Mailid = @Mailid,
        Contact_person = @Contact_person,
        Mobile_No = @Mobile_No,
        Supplier_Customer = @Supplier_Customer,
        Isactive = @Isactive,
        LedgerGroupId = @LedgerGroupId,
        SupCode = @SupCode,
        CreditDays = @CreditDays,
        VhNo = @VhNo,
        OpBalAmt = @OpBalAmt,
        OpType = @OpType,
        LastUpdate = GETDATE()
      WHERE SupplierId = @SupplierId
    `);

    res.json({
      message: 'Supplier updated successfully',
      supplierId: supplierId
    });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({
      message: 'Error updating supplier',
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and listening on all network interfaces`);
});