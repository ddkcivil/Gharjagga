export interface LegalDraftInput {
  propertyTitle: string;
  sellerName: string;
  sellerContact: string;
  buyerName: string;
  buyerContact: string;
  agreedPrice: number;
  advanceAmount: number;
  witnessName: string;
  district: string;
  municipality: string;
  ward: number;
  areaString: string;
  dueDate: string;
}

export function generateBainaAgreement(input: LegalDraftInput): string {
  const currentYearBS = 2083; // Approximated Bikram Sambat year for 2026 AD
  const formattedPrice = input.agreedPrice.toLocaleString('ne-NP');
  const formattedAdvance = input.advanceAmount.toLocaleString('ne-NP');
  const remainingAmount = (input.agreedPrice - input.advanceAmount).toLocaleString('ne-NP');

  return `घर-जग्गा बैना-बट्टा सम्झौता पत्र (EARNEST MONEY / BAINA AGREEMENT)

लिखितम आज मिति २०८३ साल ........... महिना ........... गतेका दिन, यस "घरजग्गा नेपाल" (GharJagga Nepal) मध्यस्थता प्लेटफर्म मार्फत यो सम्झौता पत्र लेखिएको छ ।

प्रथम पक्ष (विक्रेता / Seller):
नाम: ${input.sellerName}
ठेगाना: ${input.district} जिल्ला, ${input.municipality} वडा नं. ${input.ward}
सम्पर्क: ${input.sellerContact}

दोस्रो पक्ष (क्रेता / Buyer):
नाम: ${input.buyerName}
सम्पर्क: ${input.buyerContact}

तपसिल बमोजिमको जग्गा खरिद बिक्री गर्न दुवै पक्ष मन्जुर भई यो सम्झौता पत्रमा हस्ताक्षर गरेका छौँ:

१. जग्गाको विवरण (Property Specifications):
- स्थान: ${input.district} जिल्ला, ${input.municipality} वडा नं. ${input.ward}
- क्षेत्रफल: ${input.areaString}
- प्लटको विवरण: ${input.propertyTitle}

२. कारोबार रकम र बैना विवरण (Financial Transaction):
- कुल मन्जुर मूल्य: रु. ${formattedPrice} /- (अक्षरेपी .............................................................. मात्र)
- बैना बापत बुझाएको बैना रकम (Advance Deposit): रु. ${formattedAdvance} /- (अक्षरेपी .............................................................. मात्र)
- बाँकी भुक्तानी गर्नुपर्ने रकम (Remaining Balance): रु. ${remainingAmount} /-

३. मुख्य सर्तहरु (Terms & Conditions):
क) दोस्रो पक्ष (क्रेता) ले बाँकी भुक्तानी रकम रु. ${remainingAmount}/- मिति ${input.dueDate} भित्र पहिलो पक्ष (विक्रेता) लाई बुझाई मालपोत कार्यालय (Land Revenue Office) मा गई रजिष्ट्रेसन लिखत पास (Lalpurja Transfer) गरिसक्नु पर्नेछ।
ख) यदि क्रेताले तोकिएको समय भित्र रकम नबुझाएमा बैना रकम रु. ${formattedAdvance}/- जफत हुनेछ र विक्रेता उक्त जग्गा अन्य कसैलाई बिक्री गर्न स्वतन्त्र हुनेछ।
ग) यदि विक्रेताले लिखत पास गरिदिन इन्कार गरेमा वा जग्गामा कुनै कानुनी बाधा-अड्चन (dispute/mortgage) देखिएमा विक्रेताले बुझेको बैना रकमको दोब्बर रकम क्रेतालाई क्षतिपूर्ति स्वरूप तिर्नुपर्नेछ।
घ) यस कारोबारमा नेपाल सरकारको नियमानुसार लाग्ने घरजग्गा रजिष्ट्रेसन दस्तुर र पुँजीगत लाभकर (CGT) क्रेता र विक्रेताले आपसी सहमति बमोजिम बुझाउनु पर्नेछ।
ङ) यस प्लेटफर्म मार्फत हुने मध्यस्थता सेवा शुल्क (Brokerage Commission) नेपाल घरजग्गा नियमावली बमोजिम कट्टा गरिनेछ।

साक्षी (Witness):
१. श्री ${input.witnessName}

हामी दुवै पक्ष यो बैना-कट्टा लिखतमा मन्जुर भई ल्याप्चे तथा हस्ताक्षर गर्दछौं।

विक्रेताको सही: ____________________        क्रेताको सही: ____________________
मिति: ____________________                मिति: ____________________
`;
}

export function getLegalVerificationChecklist(district: string, municipality: string): string[] {
  return [
    `१. मालपोत कार्यालय (Malpot Karyalaya) स्रेस्ता चेक: verify that the title owner is indeed the seller. Check for active bank mortgages (Rokka/Bandhak).`,
    `२. नापी कार्यालय (Napi Karyalaya) नक्सा (Blue Print/Trace Map): Cross-verify the boundary lines, road access matching the actual land plot (Kitta No).`,
    `३. कर चुक्ता प्रमाणपत्र (Tax Clearance): Municipality ward tax clearance of ${municipality} for current fiscal year.`,
    `४. बाटो सिफारिस (Road Recommendation): Official ward document certifying the road access width and type (public vs private).`,
    `५. मोही लगत (Tenant verification): Confirm there is no registered tenant (Mohi) on the Lalpurja who can claim 50% land value.`,
    `६. नागरिकता र मञ्जुरीनामा: Verify Seller's National Citizenship (Nagarikta). If owner is abroad, official power of attorney (Adhikrit Manjurinama) is mandatory.`
  ];
}
