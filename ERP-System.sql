
USE ERP_Inventory
GO


/****** Object:  UserDefinedFunction [dbo].[fn_CalculateLineSubTotal]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_CalculateLineSubTotal] (
    @Quantity INT,
    @UnitPrice DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
AS
BEGIN
    RETURN (ISNULL(@Quantity, 0) * ISNULL(@UnitPrice, 0.00));
END;
GO


/****** Object:  Table [dbo].[SUPPLIERS]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SUPPLIERS](
	[SupplierID] [int] IDENTITY(1,1) NOT NULL,
	[SupplierName] [varchar](100) NOT NULL,
	[ContactNumber] [varchar](15) NOT NULL,
	[Email] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[SupplierID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


/****** Object:  Table [dbo].[PRODUCTS]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PRODUCTS](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [varchar](100) NOT NULL,
	[Category] [varchar](50) NOT NULL,
	[UnitPrice] [decimal](10, 2) NOT NULL,
	[StockQuantity] [int] NOT NULL,
	[SupplierID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


/****** Object:  View [dbo].[v_InventoryStatus]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[v_InventoryStatus] AS
SELECT 
    P.ProductID,
    P.ProductName,
    P.Category,
    P.UnitPrice,
    P.StockQuantity,
    S.SupplierName,
    S.ContactNumber AS SupplierContact
FROM PRODUCTS P
INNER JOIN SUPPLIERS S ON P.SupplierID = S.SupplierID;
GO


/****** Object:  Table [dbo].[CUSTOMERS]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CUSTOMERS](
	[CustomerID] [int] IDENTITY(1,1) NOT NULL,
	[CustomerName] [varchar](100) NOT NULL,
	[ContactNumber] [varchar](15) NOT NULL,
	[Email] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


/****** Object:  Table [dbo].[ORDERS]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ORDERS](
	[OrderID] [int] IDENTITY(1,1) NOT NULL,
	[CustomerID] [int] NULL,
	[OrderDate] [datetime] NOT NULL,
	[TotalAmount] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[OrderID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  View [dbo].[v_CustomerOrderSummary]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[v_CustomerOrderSummary] AS
SELECT 
    C.CustomerID,
    C.CustomerName,
    C.Email,
    COUNT(O.OrderID) AS TotalOrdersPlaced,
    ISNULL(SUM(O.TotalAmount), 0.00) AS TotalRevenueGenerated
FROM CUSTOMERS C
LEFT JOIN ORDERS O ON C.CustomerID = O.CustomerID
GROUP BY C.CustomerID, C.CustomerName, C.Email;
GO

/****** Object:  UserDefinedFunction [dbo].[fn_GetProductsByCategory]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_GetProductsByCategory] (
    @CategoryName VARCHAR(50)
)
RETURNS TABLE
AS
RETURN (
    SELECT 
        ProductID, 
        ProductName, 
        UnitPrice, 
        StockQuantity
    FROM PRODUCTS
    WHERE Category = @CategoryName
);
GO
/****** Object:  Table [dbo].[ORDERDETAILS]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ORDERDETAILS](
	[OrderDetailID] [int] IDENTITY(1,1) NOT NULL,
	[OrderID] [int] NULL,
	[ProductID] [int] NULL,
	[Quantity] [int] NOT NULL,
	[SubTotal] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[OrderDetailID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[CUSTOMERS] ON 

INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (1, N'Kavith Perera', N'0771234567', N'kavith@gmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (2, N'Amara Silva', N'0712345678', N'amara@yahoo.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (3, N'Nimal Fernando', N'0753456789', N'nimal@outlook.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (4, N'Saman Kumara', N'0764567890', N'saman@gmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (5, N'Ruwan Jayasinghe', N'0725678901', N'ruwan@live.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (6, N'Dilini Alwis', N'0786789012', N'dilini@gmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (7, N'Kasun Rajapaksha', N'0707890123', N'kasun@hotmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (8, N'Thilina Bandara', N'0778901234', N'thilina@gmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (9, N'Anura De Silva', N'0719012345', N'anura@yahoo.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (10, N'Menaka Herath', N'0760123456', N'menaka@gmail.com')
INSERT [dbo].[CUSTOMERS] ([CustomerID], [CustomerName], [ContactNumber], [Email]) VALUES (11, N'Lahiru Fernando', N'0774567891', N'lahiru@gmail.com')
SET IDENTITY_INSERT [dbo].[CUSTOMERS] OFF
GO
SET IDENTITY_INSERT [dbo].[ORDERDETAILS] ON 

INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (1, 1, 1, 1, CAST(245000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (2, 2, 2, 1, CAST(135000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (3, 3, 3, 1, CAST(95000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (4, 4, 4, 1, CAST(115000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (5, 5, 5, 1, CAST(185000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (6, 6, 6, 1, CAST(365000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (7, 7, 7, 1, CAST(165000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (8, 8, 8, 1, CAST(18500.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (9, 9, 9, 1, CAST(22000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (10, 10, 10, 1, CAST(45000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERDETAILS] ([OrderDetailID], [OrderID], [ProductID], [Quantity], [SubTotal]) VALUES (11, 11, 11, 1, CAST(275000.00 AS Decimal(10, 2)))
SET IDENTITY_INSERT [dbo].[ORDERDETAILS] OFF
GO
SET IDENTITY_INSERT [dbo].[ORDERS] ON 

INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (1, 1, CAST(N'2026-05-10T00:00:00.000' AS DateTime), CAST(245000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (2, 2, CAST(N'2026-05-11T00:00:00.000' AS DateTime), CAST(135000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (3, 3, CAST(N'2026-05-12T00:00:00.000' AS DateTime), CAST(95000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (4, 4, CAST(N'2026-05-12T00:00:00.000' AS DateTime), CAST(115000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (5, 5, CAST(N'2026-05-13T00:00:00.000' AS DateTime), CAST(185000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (6, 1, CAST(N'2026-05-14T00:00:00.000' AS DateTime), CAST(365000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (7, 7, CAST(N'2026-05-14T00:00:00.000' AS DateTime), CAST(165000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (8, 8, CAST(N'2026-05-15T00:00:00.000' AS DateTime), CAST(18500.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (9, 9, CAST(N'2026-05-15T00:00:00.000' AS DateTime), CAST(22000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (10, 10, CAST(N'2026-05-16T00:00:00.000' AS DateTime), CAST(45000.00 AS Decimal(10, 2)))
INSERT [dbo].[ORDERS] ([OrderID], [CustomerID], [OrderDate], [TotalAmount]) VALUES (11, 11, CAST(N'2026-05-17T00:00:00.000' AS DateTime), CAST(550000.00 AS Decimal(10, 2)))
SET IDENTITY_INSERT [dbo].[ORDERS] OFF
GO
SET IDENTITY_INSERT [dbo].[PRODUCTS] ON 

INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (1, N'Samsung Galaxy S24', N'Electronics', CAST(245000.00 AS Decimal(10, 2)), 15, 1)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (2, N'LG Smart TV 43', N'Electronics', CAST(135000.00 AS Decimal(10, 2)), 8, 2)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (3, N'Damro Refrigerator', N'Home Appliances', CAST(90250.00 AS Decimal(10, 2)), 12, 3)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (4, N'Panasonic Washing Machine', N'Home Appliances', CAST(109250.00 AS Decimal(10, 2)), 5, 4)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (5, N'Dell Inspiron Laptop', N'Electronics', CAST(185000.00 AS Decimal(10, 2)), 20, 5)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (6, N'Apple iPhone 15 Pro', N'Electronics', CAST(365000.00 AS Decimal(10, 2)), 10, 6)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (7, N'Inverter Air Conditioner', N'Home Appliances', CAST(156750.00 AS Decimal(10, 2)), 6, 8)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (8, N'Philips Rice Cooker', N'Home Appliances', CAST(18500.00 AS Decimal(10, 2)), 45, 8)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (9, N'Prestige Induction Cooktop', N'Home Appliances', CAST(22000.00 AS Decimal(10, 2)), 30, 9)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (10, N'Asus Gaming Router', N'Electronics', CAST(45000.00 AS Decimal(10, 2)), 25, 10)
INSERT [dbo].[PRODUCTS] ([ProductID], [ProductName], [Category], [UnitPrice], [StockQuantity], [SupplierID]) VALUES (11, N'Lenovo ThinkPad E14', N'Electronics', CAST(275000.00 AS Decimal(10, 2)), 17, 11)
SET IDENTITY_INSERT [dbo].[PRODUCTS] OFF
GO
SET IDENTITY_INSERT [dbo].[SUPPLIERS] ON 

INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (1, N'Abans Wholesale', N'0112333444', N'wholesale@abans.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (2, N'Singer Distributors', N'0112555666', N'dist@singer.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (3, N'Damro Corporate', N'0332255444', N'corporate@damro.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (4, N'Softlogic Retail', N'0114777888', N'retail@softlogic.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (5, N'John Keells Logistics', N'0112111222', N'info@jkl.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (6, N'Dialog Axiata Supply', N'0777333444', N'supply@dialog.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (7, N'Mobitel Procurement', N'0711222333', N'pro@mobitel.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (8, N'Hayleys Consumer', N'0112666777', N'consumer@hayleys.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (9, N'Browns & Company', N'0112888999', N'industrial@browns.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (10, N'Lanka ICT Vendors', N'0112999000', N'sales@lankaict.lk')
INSERT [dbo].[SUPPLIERS] ([SupplierID], [SupplierName], [ContactNumber], [Email]) VALUES (11, N'Tech World Lanka', N'0112345678', N'info@techworld.lk')
SET IDENTITY_INSERT [dbo].[SUPPLIERS] OFF
GO
SET ANSI_PADDING ON
GO


/****** Object:  Index [UQ__CUSTOMER__570665C666CF2752]    Script Date: 5/19/2026 2:01:38 PM ******/
ALTER TABLE [dbo].[CUSTOMERS] ADD UNIQUE NONCLUSTERED 
(
	[ContactNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO


/****** Object:  Index [UQ__CUSTOMER__A9D10534706DA0CF]    Script Date: 5/19/2026 2:01:38 PM ******/
ALTER TABLE [dbo].[CUSTOMERS] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO


/****** Object:  Index [UQ__SUPPLIER__A9D10534FC7AEC93]    Script Date: 5/19/2026 2:01:38 PM ******/
ALTER TABLE [dbo].[SUPPLIERS] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ORDERS] ADD  DEFAULT (getdate()) FOR [OrderDate]
GO
ALTER TABLE [dbo].[ORDERS] ADD  DEFAULT ((0.00)) FOR [TotalAmount]
GO
ALTER TABLE [dbo].[PRODUCTS] ADD  DEFAULT ((0)) FOR [StockQuantity]
GO
ALTER TABLE [dbo].[ORDERDETAILS]  WITH CHECK ADD FOREIGN KEY([OrderID])
REFERENCES [dbo].[ORDERS] ([OrderID])
GO
ALTER TABLE [dbo].[ORDERDETAILS]  WITH CHECK ADD FOREIGN KEY([ProductID])
REFERENCES [dbo].[PRODUCTS] ([ProductID])
GO
ALTER TABLE [dbo].[ORDERS]  WITH CHECK ADD FOREIGN KEY([CustomerID])
REFERENCES [dbo].[CUSTOMERS] ([CustomerID])
GO
ALTER TABLE [dbo].[PRODUCTS]  WITH CHECK ADD FOREIGN KEY([SupplierID])
REFERENCES [dbo].[SUPPLIERS] ([SupplierID])
GO
ALTER TABLE [dbo].[ORDERDETAILS]  WITH CHECK ADD CHECK  (([Quantity]>(0)))
GO
ALTER TABLE [dbo].[ORDERDETAILS]  WITH CHECK ADD CHECK  (([SubTotal]>=(0)))
GO
ALTER TABLE [dbo].[PRODUCTS]  WITH CHECK ADD CHECK  (([StockQuantity]>=(0)))
GO
ALTER TABLE [dbo].[PRODUCTS]  WITH CHECK ADD CHECK  (([UnitPrice]>(0)))
GO


/****** Object:  StoredProcedure [dbo].[sp_ProcessNewOrderHeader]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_ProcessNewOrderHeader]
    @CustomerID INT,
    @GeneratedOrderID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Instantiate base invoice structural header tracking record
    INSERT INTO ORDERS (CustomerID, OrderDate, TotalAmount)
    VALUES (@CustomerID, GETDATE(), 0.00);
    
    -- Return the auto-incremented tracking number back to the client app
    SET @GeneratedOrderID = SCOPE_IDENTITY();
END;
GO



/****** Object:  StoredProcedure [dbo].[sp_RegisterNewCustomer]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_RegisterNewCustomer]
    @Name VARCHAR(100),
    @Contact VARCHAR(15),
    @Email VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if the unique identifier phone contact key already exists
    IF EXISTS (SELECT 1 FROM CUSTOMERS WHERE ContactNumber = @Contact)
    BEGIN
        RAISERROR('Customer registration rejected: Contact phone number already exists in the ERP system.', 16, 1);
        RETURN;
    END
    
    -- Execute secure structured record creation
    INSERT INTO CUSTOMERS (CustomerName, ContactNumber, Email)
    VALUES (@Name, @Contact, @Email);
END;
GO


/****** Object:  Trigger [dbo].[trg_MaintainOrderTotal]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [dbo].[trg_MaintainOrderTotal]
ON [dbo].[ORDERDETAILS]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Aggregatively increment parent order transactional net figures
    UPDATE O
    SET O.TotalAmount = O.TotalAmount + (SELECT SUM(SubTotal) FROM INSERTED WHERE OrderID = O.OrderID)
    FROM ORDERS O
    WHERE O.OrderID IN (SELECT DISTINCT OrderID FROM INSERTED);
END;
GO
ALTER TABLE [dbo].[ORDERDETAILS] ENABLE TRIGGER [trg_MaintainOrderTotal]
GO


/****** Object:  Trigger [dbo].[trg_UpdateStockOnOrder]    Script Date: 5/19/2026 2:01:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [dbo].[trg_UpdateStockOnOrder]
ON [dbo].[ORDERDETAILS]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Synchronously deduct stock quantity balances matching order metrics
    UPDATE P
    SET P.StockQuantity = P.StockQuantity - I.Quantity
    FROM PRODUCTS P
    INNER JOIN INSERTED I ON P.ProductID = I.ProductID;
END;
GO
ALTER TABLE [dbo].[ORDERDETAILS] ENABLE TRIGGER [trg_UpdateStockOnOrder]
GO
USE [master]
GO
ALTER DATABASE [ERP_Inventory] SET  READ_WRITE 
GO
