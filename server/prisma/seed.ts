import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Al-Bari Press database...');

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      name: 'Al-Bari Press & Digital Sign',
      nameBn: 'ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন',
      address: "Mohammadia Hotel Lane, Opposite Hawker's Market, Maijdee, Noakhali",
      addressBn: 'মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী',
      phone: '01618-182365',
      email: 'albariprintingpress@gmail.com',
      logoUrl: '/assets/albari-logo.jpg',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      invoicePrefix: 'INV-2026-',
      orderPrefix: 'PR-2026-',
      defaultLanguage: 'bn',
      timezone: 'Asia/Dhaka',
      aiProvider: 'pollinations',
      termsBn: '১. মালামাল ডেলিভারির সময় ভালভাবে দেখে বুঝে নিন।\n২. ডেলিভারির পর কোন অভিযোগ গ্রহণযোগ্য নয়।\n৩. বাকী টাকা পরিশোধ সাপেক্ষে পণ্য হস্তান্তর করা হবে।',
      termsEn: '1. Please verify goods upon receipt.\n2. No complaints accepted after delivery.\n3. Full payment required prior to delivery.'
    }
  });

  // 2. Users & Staff
  const adminPassword = await bcrypt.hash('taiyan26', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const designerPassword = await bcrypt.hash('designer123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const owner = await prisma.user.upsert({
    where: { username: 'albari' },
    update: {
      passwordHash: adminPassword,
      role: 'OWNER',
      active: true
    },
    create: {
      username: 'albari',
      email: 'albari@albaripress.com',
      passwordHash: adminPassword,
      fullName: 'Al-Bari Press Owner',
      fullNameBn: 'আল-বারী প্রেস এডমিন',
      phone: '01618182365',
      role: 'OWNER'
    }
  });

  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@albaripress.com',
      passwordHash: managerPassword,
      fullName: 'Kabir Hossain',
      fullNameBn: 'কবীর হোসেন (ম্যানেজার)',
      phone: '01812345678',
      role: 'MANAGER'
    }
  });

  const designer = await prisma.user.upsert({
    where: { username: 'designer' },
    update: {},
    create: {
      username: 'designer',
      email: 'designer@albaripress.com',
      passwordHash: designerPassword,
      fullName: 'Zahid Sir',
      fullNameBn: 'জাহিদ স্যার (গ্রাফিক্স ডিজাইনার)',
      phone: '01978100252',
      role: 'DESIGNER'
    }
  });

  const staff = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      email: 'staff@albaripress.com',
      passwordHash: staffPassword,
      fullName: 'Rahim Mia',
      fullNameBn: 'রহিম মিয়া (প্রিন্টিং অপারেটর)',
      phone: '01712345678',
      role: 'STAFF'
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { username: '01978100252' },
    update: {},
    create: {
      username: '01978100252',
      email: 'paramountzone@gmail.com',
      passwordHash: customerPassword,
      fullName: 'Paramount Zone English Academy',
      fullNameBn: 'প্যারামাউন্ট জোন ইংলিশ একাডেমি',
      phone: '01978100252',
      role: 'CUSTOMER'
    }
  });

  // 3. Product Categories
  const categoriesData = [
    { name: 'Posters & Flyers', nameBn: 'পোস্টার ও লিফলেট', slug: 'posters-flyers', icon: 'FileText' },
    { name: 'Banners & Signage', nameBn: 'ব্যানার ও সাইনবোর্ড', slug: 'banners-signage', icon: 'Image' },
    { name: 'Crests & Medals', nameBn: 'ক্রেস্ট ও মেডেল', slug: 'crests-medals', icon: 'Award' },
    { name: 'Business Stationery', nameBn: 'অফিসিয়াল ও ব্যবসায়িক পেপারস', slug: 'stationery', icon: 'BookOpen' },
    { name: 'Seals & Stamps', nameBn: 'সীল ও রাবার স্ট্যাম্প', slug: 'seals-stamps', icon: 'Stamp' },
    { name: 'Custom Design', nameBn: 'গ্রাফিক্স ডিজাইন সেবা', slug: 'custom-design', icon: 'Palette' }
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const c = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        icon: cat.icon
      }
    });
    catMap[cat.slug] = c.id;
  }

  // 4. Products using genuine Al-Bari Press samples
  const products = [
    {
      categoryId: catMap['stationery'],
      name: 'Doctor Prescription File Folder',
      nameBn: 'ডাঃ ফাইল ও প্রেসক্রিপশন ফোল্ডার',
      slug: 'doctor-prescription-file',
      basePrice: 18.0,
      unit: 'PIECE',
      unitBn: 'টি',
      description: 'Medical prescription file folder with custom doctor bio, clinic branding, and inner pocket.',
      descriptionBn: 'ডাক্তারি প্রেসক্রিপশন ফোল্ডার, আর্ট কার্ড ৩০০ জিএসএম, গ্লস ল্যামিনেশন ও পকেটসহ।',
      availableSizes: ['10x15 inch', 'A4 Folded'],
      material: 'Art Card 300 GSM',
      materialBn: '৩০০ জিএসএম আর্ট কার্ড',
      leadTimeDays: 4,
      imageUrl: '/assets/doctor-file-promo.jpg'
    },
    {
      categoryId: catMap['stationery'],
      name: 'Premium Visiting Card',
      nameBn: 'স্মার্ট বিজনেস ভিজিটিং কার্ড',
      slug: 'visiting-card-premium',
      basePrice: 1.2,
      unit: 'PIECE',
      unitBn: 'টি',
      description: 'Standard 3.5x2 inch business card with matte lamination, spot UV, or metallic foil.',
      descriptionBn: 'উন্নতমানের ভিজিটিং কার্ড, চাররঙা প্রিন্ট, ম্যাট ল্যামিনেশন ও স্পট ইউভি সুবিধা।',
      availableSizes: ['3.5x2 inch'],
      material: 'Swedish Board 350 GSM',
      materialBn: '৩৫০ জিএসএম সুইডিশ বোর্ড',
      leadTimeDays: 2,
      imageUrl: '/assets/visiting-card-promo.jpg'
    },
    {
      categoryId: catMap['stationery'],
      name: 'Cash Memo & Voucher Pad',
      nameBn: 'ক্যাশ মেমো ও ভাউচার বই',
      slug: 'cash-memo-voucher-pad',
      basePrice: 85.0,
      unit: 'COPY',
      unitBn: 'বই',
      description: 'Duplicate / Triplicate carbonless cash memo book, 100 sets per book with serial numbering.',
      descriptionBn: '১/২/৩ পার্ট কার্বনলেস ক্যাশ মেমো, ১০০ পাতার বাঁধাই ও নিখুঁত নাম্বারিং।',
      availableSizes: ['1/8 Size', '1/4 Size', 'A5'],
      material: 'NCR Carbonless Paper',
      materialBn: 'এনসিআর কার্বনলেস পেপার',
      leadTimeDays: 3,
      imageUrl: '/assets/cash-memo-promo.jpg'
    },
    {
      categoryId: catMap['crests-medals'],
      name: 'Wooden & Golden Metal Crest',
      nameBn: 'উডেন ও গোল্ডেন মেটালিক ক্রেস্ট',
      slug: 'wooden-metal-crest',
      basePrice: 650.0,
      unit: 'PIECE',
      unitBn: 'টি',
      description: 'Honorary award crest with mahogany wooden frame, gold engraved metallic plate and box.',
      descriptionBn: 'সম্মাননা ও সংবর্ধনা ক্রেস্ট, মেহগনি কাঠের বেস, খোদাই করা গোল্ডেন মেটাল প্লেট ও ভেলভেট বক্স।',
      availableSizes: ['8 inch', '10 inch', '12 inch'],
      material: 'Solid Wood & Brass Sheet',
      materialBn: 'মেহগনি কাঠ ও পিতলের পাত',
      leadTimeDays: 3,
      imageUrl: '/assets/crest-award-promo.jpg'
    },
    {
      categoryId: catMap['seals-stamps'],
      name: 'Self-Inking Flash Stamp & Seal',
      nameBn: 'ফ্ল্যাশ ও অটোমেটিক রাবার সীল',
      slug: 'flash-seal-stamp',
      basePrice: 350.0,
      unit: 'PIECE',
      unitBn: 'টি',
      description: 'Japanese ink cartridge flash stamp, sharp impression without separate ink pad.',
      descriptionBn: 'কালি ছাড়া স্বয়ংক্রিয় স্ট্যাম্প, দ্রুত ডেলিভারি ও দীর্ঘস্থায়ী ইমপ্রেশন।',
      availableSizes: ['Round 38mm', 'Oval 45x30mm', 'Rectangle 50x20mm'],
      material: 'Colop / Trodat Casing',
      materialBn: 'ইমপোর্টেড কলপ কেসিং',
      leadTimeDays: 1,
      imageUrl: '/assets/seal-stamp-promo.jpg'
    },
    {
      categoryId: catMap['posters-flyers'],
      name: 'Islamic Mahfil & Event Poster',
      nameBn: 'ওয়াজ মাহফিল ও ধর্মীয় কনফারেন্স পোস্টার',
      slug: 'waz-mahfil-poster',
      basePrice: 6.5,
      unit: 'COPY',
      unitBn: 'কপি',
      description: 'High impact full-color conference poster for madrasa waz mahfil, public events and rallies.',
      descriptionBn: 'ওয়াজ মাহফিল ও ধর্মীয় সমাবেশের চাররঙা পোস্টার, নিখুঁত টাইপোগ্রাফি ও অফসেট প্রিন্ট।',
      availableSizes: ['18x23 inch', '20x30 inch'],
      material: 'Offset Paper 70 GSM / Art Paper 100 GSM',
      materialBn: '৭০ জিএসএম অফসেট / ১০০ জিএসএম আর্ট পেপার',
      leadTimeDays: 2,
      imageUrl: '/assets/waz-mahfil-posters.jpg'
    },
    {
      categoryId: catMap['banners-signage'],
      name: 'Large Format Digital Vinyl Banner',
      nameBn: 'ডিজিটাল পিভিসি ও প্যানাফ্লেক্স ব্যানার',
      slug: 'digital-vinyl-banner',
      basePrice: 16.0,
      unit: 'SQFT',
      unitBn: 'বর্গফুট',
      description: 'Outdoor weatherproof digital flex banner printed with Japanese solvent ink.',
      descriptionBn: 'উচ্চমানের ডিজিটাল প্রিন্ট, রোদ-বৃষ্টি প্রতিরোধী জাপানিজ সলভেন্ট কালি ও আইলেট ফিনিশিং।',
      availableSizes: ['Custom Dimensions'],
      material: 'Star Flex 320 GSM',
      materialBn: 'স্টার ফ্লেক্স ৩২০ জিএসএম',
      leadTimeDays: 1,
      imageUrl: '/assets/digital-print-machine.jpg'
    },
    {
      categoryId: catMap['posters-flyers'],
      name: 'Restaurant Menu & Food Brochure',
      nameBn: 'রেস্টুরেন্ট মেনু কার্ড ও ফুড ব্রোশিউর',
      slug: 'restaurant-menu-brochure',
      basePrice: 45.0,
      unit: 'COPY',
      unitBn: 'কপি',
      description: 'Multi-page glossy restaurant food booklet, waterproof thermal lamination with saddle stitch.',
      descriptionBn: 'রেস্তোরাঁর কালারফুল মেনু কার্ড, চকচকে ল্যামিনেশন ও দীর্ঘস্থায়ী পিন বাঁধাই।',
      availableSizes: ['A4 Folded', '8.5x14 inch'],
      material: 'Gloss Art Paper 150 GSM',
      materialBn: '১৫০ জিএসএম গ্লস আর্ট পেপার',
      leadTimeDays: 3,
      imageUrl: '/assets/restaurant-menu-brochure.jpg'
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        nameBn: p.nameBn,
        slug: p.slug,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        unit: p.unit,
        unitBn: p.unitBn,
        description: p.description,
        descriptionBn: p.descriptionBn,
        availableSizes: JSON.stringify(p.availableSizes),
        material: p.material,
        materialBn: p.materialBn,
        leadTimeDays: p.leadTimeDays,
        imageUrl: p.imageUrl
      }
    });
  }

  // 5. Customers
  const customer1 = await prisma.customer.upsert({
    where: { phone: '01978100252' },
    update: {},
    create: {
      customerCode: 'CUST-0001',
      fullName: 'Paramount Zone English Academy',
      fullNameBn: 'প্যারামাউন্ট জোন ইংলিশ একাডেমি (জাহিদ স্যার)',
      phone: '01978100252',
      email: 'paramountzone@gmail.com',
      address: "Safe Diagnostic Center (3rd Floor), Napiter Pol, Maijdee, Noakhali",
      addressBn: 'সেফটি ডায়াগনস্টিক সেন্টার (৩য় তলা), নাপিতের পোল, মাইজদী, নোয়াখালী',
      customerType: 'SCHOOL_COLLEGE',
      organizationName: 'Paramount Zone'
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { phone: '01842529720' },
    update: {},
    create: {
      customerCode: 'CUST-0002',
      fullName: "Mother's Kitchen Restaurant",
      fullNameBn: "মাদার্স কিচেন রেস্টুরেন্ট",
      phone: '01842529720',
      email: 'motherskitchen.noakhali@gmail.com',
      address: 'Maijdee Court, Noakhali',
      addressBn: 'মাইজদী কোর্ট, নোয়াখালী',
      customerType: 'BUSINESS',
      organizationName: "Mother's Kitchen"
    }
  });

  const customer3 = await prisma.customer.upsert({
    where: { phone: '01715889900' },
    update: {},
    create: {
      customerCode: 'CUST-0003',
      fullName: 'Rayanagar Imdadul Uloom Madrasa',
      fullNameBn: 'রায়নগর ইমদাদুল উলূম মাদ্রাসা',
      phone: '01715889900',
      address: 'Rayanagar, Noakhali',
      addressBn: 'রায়নগর, নোয়াখালী',
      customerType: 'ORGANIZATION',
      organizationName: 'ইমদাদুল উলূম মাদ্রাসা'
    }
  });

  const customer4 = await prisma.customer.upsert({
    where: { phone: '01819223344' },
    update: {},
    create: {
      customerCode: 'CUST-0004',
      fullName: 'Dr. Md. Abul Kalam Azad',
      fullNameBn: 'ডাঃ মোঃ আবুল কালাম আজাদ',
      phone: '01819223344',
      address: 'Maijdee General Hospital Road, Noakhali',
      addressBn: 'মাইজদী জেনারেল হাসপাতাল রোড, নোয়াখালী',
      customerType: 'INDIVIDUAL',
      organizationName: 'City Medical College'
    }
  });

  // 6. Orders
  // Order 1: Paramount Zone (Posters & Flyers)
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'PR-2026-0001' },
    update: {},
    create: {
      orderNumber: 'PR-2026-0001',
      customerId: customer1.id,
      createdById: owner.id,
      assignedDesignerId: designer.id,
      assignedStaffId: staff.id,
      orderDate: new Date('2026-10-15T10:00:00Z'),
      deliveryDate: new Date('2026-10-22T17:00:00Z'),
      productionStatus: 'IN_PRODUCTION',
      paymentStatus: 'PARTIALLY_PAID',
      priority: 'HIGH',
      subtotal: 6500.0,
      discount: 300.0,
      deliveryCharge: 100.0,
      additionalCharges: 0.0,
      totalAmount: 6300.0,
      amountPaid: 3000.0,
      amountDue: 3300.0,
      customerNotes: 'SSC / Dakhil Spoken English free class poster 1000 copies.',
      trackingToken: 'track-pz-202601',
      items: {
        create: [
          {
            productName: 'SSC / Dakhil Spoken English Poster',
            productNameBn: 'এসএসসি / দাখিল স্পোকেন ইংলিশ পোস্টার',
            specifications: 'Size: 18x23 inch, 4-color offset, 85 GSM Art Paper',
            quantity: 1000,
            unit: 'COPY',
            unitBn: 'কপি',
            unitPrice: 6.5,
            subtotal: 6500.0
          }
        ]
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-2026-0001',
            customerId: customer1.id,
            amount: 3000.0,
            method: 'BKASH',
            referenceNumber: 'TrxID: BK789X10Q',
            receivedById: owner.id,
            notes: 'Advance bKash payment',
            receiptNumber: 'RCT-2026-0001'
          }
        ]
      },
      productionJobs: {
        create: [
          {
            jobCode: 'PRD-2026-0001',
            assignedStaffId: staff.id,
            stage: 'PRINTING',
            stageBn: 'ছাপাখানা প্রিন্টিং চলছে',
            quantityOrdered: 1000,
            quantityProduced: 450,
            quantityWasted: 12,
            machineNotes: 'Offset machine #2 Heidelberg speed master',
            status: 'IN_PROGRESS'
          }
        ]
      }
    }
  });

  // Order 2: Mother's Kitchen (Menu Card Brochure) - Delivered & Paid
  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'PR-2026-0002' },
    update: {},
    create: {
      orderNumber: 'PR-2026-0002',
      customerId: customer2.id,
      createdById: manager.id,
      assignedDesignerId: designer.id,
      assignedStaffId: staff.id,
      orderDate: new Date('2026-10-12T11:30:00Z'),
      deliveryDate: new Date('2026-10-16T15:00:00Z'),
      productionStatus: 'DELIVERED',
      paymentStatus: 'PAID',
      priority: 'NORMAL',
      subtotal: 9000.0,
      discount: 500.0,
      deliveryCharge: 0.0,
      additionalCharges: 0.0,
      totalAmount: 8500.0,
      amountPaid: 8500.0,
      amountDue: 0.0,
      customerNotes: 'Glossy food menu card 200 copies with thermal lamination.',
      trackingToken: 'track-mk-202602',
      items: {
        create: [
          {
            productName: 'Restaurant Food Menu Booklet',
            productNameBn: 'রেস্টুরেন্ট ফুড মেনু বুকলেট',
            specifications: 'A4 4-Page Folded, 150 GSM Art Paper, Gloss Thermal Lamination',
            quantity: 200,
            unit: 'COPY',
            unitBn: 'কপি',
            unitPrice: 45.0,
            subtotal: 9000.0
          }
        ]
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-2026-0002',
            customerId: customer2.id,
            amount: 4000.0,
            method: 'CASH',
            referenceNumber: 'Direct Cash Counter',
            receivedById: manager.id,
            notes: 'Advance cash payment',
            receiptNumber: 'RCT-2026-0002'
          },
          {
            paymentNumber: 'PAY-2026-0003',
            customerId: customer2.id,
            amount: 4500.0,
            method: 'NAGAD',
            referenceNumber: 'Nagad Trx: NG908812',
            receivedById: manager.id,
            notes: 'Final settlement during delivery',
            receiptNumber: 'RCT-2026-0003'
          }
        ]
      },
      productionJobs: {
        create: [
          {
            jobCode: 'PRD-2026-0002',
            assignedStaffId: staff.id,
            stage: 'DELIVERED',
            stageBn: 'ডেলিভারি সম্পন্ন',
            quantityOrdered: 200,
            quantityProduced: 200,
            quantityWasted: 8,
            machineNotes: 'Lamination and center staple binding finished cleanly',
            status: 'COMPLETED'
          }
        ]
      }
    }
  });

  // Order 3: Dr. Abul Kalam Azad (Prescription File Folder) - Ready for Delivery
  const order3 = await prisma.order.upsert({
    where: { orderNumber: 'PR-2026-0003' },
    update: {},
    create: {
      orderNumber: 'PR-2026-0003',
      customerId: customer4.id,
      createdById: owner.id,
      assignedDesignerId: designer.id,
      assignedStaffId: staff.id,
      orderDate: new Date('2026-10-16T14:20:00Z'),
      deliveryDate: new Date('2026-10-20T12:00:00Z'),
      productionStatus: 'READY_FOR_DELIVERY',
      paymentStatus: 'PARTIALLY_PAID',
      priority: 'NORMAL',
      subtotal: 9000.0,
      discount: 0.0,
      deliveryCharge: 0.0,
      additionalCharges: 0.0,
      totalAmount: 9000.0,
      amountPaid: 5000.0,
      amountDue: 4000.0,
      customerNotes: 'Doctor prescription file folder 500 copies with doctor bio and inner pocket.',
      trackingToken: 'track-dr-202603',
      items: {
        create: [
          {
            productName: 'Dr. Prescription File Folder',
            productNameBn: 'ডাক্তারি প্রেসক্রিপশন ফাইল ফোল্ডার',
            specifications: '300 GSM Art Card, 4-Color Print, Gloss Lamination, Die-cut pocket',
            quantity: 500,
            unit: 'PIECE',
            unitBn: 'টি',
            unitPrice: 18.0,
            subtotal: 9000.0
          }
        ]
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-2026-0004',
            customerId: customer4.id,
            amount: 5000.0,
            method: 'CASH',
            receivedById: owner.id,
            notes: 'Advance cash received',
            receiptNumber: 'RCT-2026-0004'
          }
        ]
      },
      productionJobs: {
        create: [
          {
            jobCode: 'PRD-2026-0003',
            assignedStaffId: staff.id,
            stage: 'READY_FOR_DELIVERY',
            stageBn: 'ডেলিভারির জন্য প্রস্তুত',
            quantityOrdered: 500,
            quantityProduced: 500,
            quantityWasted: 15,
            machineNotes: 'Die-cut pocket glued and packed in 5 cartons',
            status: 'IN_PROGRESS'
          }
        ]
      }
    }
  });

  // 7. Expenses
  await prisma.expense.createMany({
    data: [
      {
        expenseNumber: 'EXP-2026-0001',
        category: 'PAPER_RAW_MATERIALS',
        categoryBn: 'কাগজ ও কাঁচামাল',
        amount: 8500.0,
        paymentMethod: 'BANK_TRANSFER',
        vendor: 'Dhaka Paper House, Arambagh',
        description: 'Art Card 300 GSM 4 Packets and Offset paper 70 GSM 5 Reams',
        date: new Date('2026-10-10T11:00:00Z'),
        createdById: owner.id,
        approved: true
      },
      {
        expenseNumber: 'EXP-2026-0002',
        category: 'INK_TONER',
        categoryBn: 'কালি ও টোনার',
        amount: 3200.0,
        paymentMethod: 'BKASH',
        vendor: 'Konica Minolta Ink Suppliers',
        description: 'CMYK 4-color solvent printing ink for digital flex plotter',
        date: new Date('2026-10-12T14:30:00Z'),
        createdById: owner.id,
        approved: true
      },
      {
        expenseNumber: 'EXP-2026-0003',
        category: 'ELECTRICITY',
        categoryBn: 'বিদ্যুৎ বিল',
        amount: 4500.0,
        paymentMethod: 'BKASH',
        vendor: 'BPDB Maijdee Electric Office',
        description: 'Monthly press machine power utility bill',
        date: new Date('2026-10-14T09:00:00Z'),
        createdById: manager.id,
        approved: true
      },
      {
        expenseNumber: 'EXP-2026-0004',
        category: 'MACHINE_MAINTENANCE',
        categoryBn: 'মেশিন মেরামত ও রক্ষণাবেক্ষণ',
        amount: 1800.0,
        paymentMethod: 'CASH',
        vendor: 'Local Technical Technician',
        description: 'Hydraulic cutting machine blade sharpening and lubrication',
        date: new Date('2026-10-16T16:00:00Z'),
        createdById: manager.id,
        approved: true
      }
    ]
  });

  // 8. Design Asset Library
  await prisma.designAsset.createMany({
    data: [
      {
        designCode: 'DSN-2026-0001',
        title: 'Paramount Zone Spoken English Coaching Poster',
        titleBn: 'প্যারামাউন্ট জোন স্পোকেন ইংলিশ পোস্টার',
        category: 'Poster',
        customerId: customer1.id,
        orderId: order1.id,
        designerId: designer.id,
        prompt: 'SSC / Dakhil Spoken English free class poster design, vibrant red and yellow headline, teacher photo with cap, clean layout.',
        artworkUrl: '/assets/coaching-poster.jpg',
        status: 'APPROVED',
        dimensions: '18x23 inch',
        colorMode: 'CMYK',
        resolution: '300 DPI'
      },
      {
        designCode: 'DSN-2026-0002',
        title: 'Imdadul Uloom Madrasa Islamic Waz Mahfil Poster',
        titleBn: 'ইমদাদুল উলূম মাদ্রাসা ওয়াজ মাহফিল পোস্টার',
        category: 'Poster',
        customerId: customer3.id,
        designerId: designer.id,
        prompt: 'Annual Islamic Waz Mahfil poster, ornate Islamic dome arch, green and orange palette, guest speaker list.',
        artworkUrl: '/assets/waz-mahfil-posters.jpg',
        status: 'APPROVED',
        dimensions: '20x30 inch',
        colorMode: 'CMYK',
        resolution: '300 DPI'
      },
      {
        designCode: 'DSN-2026-0003',
        title: 'Honorary Recognition Shield Crest',
        titleBn: 'সম্মাননা ক্রেস্ট ডিজাইন',
        category: 'Crest',
        designerId: designer.id,
        prompt: 'Guest of honor recognition crest design with golden leaf border, crest shield shape, wooden base.',
        artworkUrl: '/assets/crest-award-promo.jpg',
        status: 'APPROVED',
        dimensions: '8x10 inch',
        colorMode: 'RGB',
        resolution: '300 DPI'
      },
      {
        designCode: 'DSN-2026-0004',
        title: 'Eid-ul-Fitr Greetings Public Banner',
        titleBn: 'পবিত্র ঈদ-উল-ফিতর শুভেচ্ছা ব্যানার',
        category: 'Banner',
        designerId: designer.id,
        prompt: 'Eid Mubarak greeting digital banner with lantern crescent, candidate photo, festive green and gold.',
        artworkUrl: '/assets/eid-banner.jpg',
        status: 'APPROVED',
        dimensions: '10x4 feet',
        colorMode: 'CMYK',
        resolution: '150 DPI'
      }
    ]
  });

  console.log('Al-Bari Press database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
