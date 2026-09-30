import { ImportSourceApp } from '../../../types';

export interface CRMFieldDefinition {
  key: string;
  label: string;
  category: 'core' | 'contact_info' | 'organization' | 'address' | 'metadata';
  required?: boolean;
  description: string;
  aliases: string[]; // Common column header variations in exported files
}

export const CRM_CONTACT_FIELDS: CRMFieldDefinition[] = [
  {
    key: 'firstName',
    label: 'First Name',
    category: 'core',
    required: true,
    description: 'First or given name of the contact record',
    aliases: [
      'first name',
      'firstname',
      'first',
      'given name',
      'fname',
      'contact first name',
      'name (first)',
      'forename',
    ],
  },
  {
    key: 'lastName',
    label: 'Last Name',
    category: 'core',
    required: true,
    description: 'Last or family name of the contact record',
    aliases: [
      'last name',
      'lastname',
      'last',
      'surname',
      'family name',
      'lname',
      'contact last name',
      'name (last)',
    ],
  },
  {
    key: 'email',
    label: 'Email Address',
    category: 'contact_info',
    required: true,
    description: 'Primary corporate or direct business email address',
    aliases: [
      'email',
      'email address',
      'e-mail',
      'e-mail address',
      'primary email',
      'business email',
      'work email',
      'mail',
      'electronic mail',
    ],
  },
  {
    key: 'phone',
    label: 'Phone Number',
    category: 'contact_info',
    description: 'Direct line or office business telephone number',
    aliases: [
      'phone',
      'phone number',
      'telephone',
      'business phone',
      'work phone',
      'office phone',
      'main phone',
      'tel',
      'phone 1',
    ],
  },
  {
    key: 'mobile',
    label: 'Mobile / Cell Phone',
    category: 'contact_info',
    description: 'Personal or mobile cellular number',
    aliases: [
      'mobile',
      'mobile phone',
      'cell',
      'cell phone',
      'cellular',
      'mobile number',
      'phone 2',
      'direct cell',
    ],
  },
  {
    key: 'jobTitle',
    label: 'Designation / Job Title',
    category: 'core',
    description: 'Professional role or organizational job title',
    aliases: [
      'job title',
      'jobtitle',
      'title',
      'designation',
      'position',
      'role',
      'occupation',
      'business title',
    ],
  },
  {
    key: 'company',
    label: 'Company / Organization',
    category: 'organization',
    description: 'Associated business account or employer organization name',
    aliases: [
      'company',
      'company name',
      'account',
      'account name',
      'organization',
      'organisation',
      'business name',
      'employer',
      'firm',
    ],
  },
  {
    key: 'type',
    label: 'Relationship Type',
    category: 'organization',
    description: 'Lifecycle stage classification (e.g. Lead, Customer, Vendor, Other)',
    aliases: [
      'type',
      'contact type',
      'lifecycle stage',
      'status',
      'stage',
      'lead status',
      'category',
    ],
  },
  {
    key: 'mailingAddress',
    label: 'Mailing Address',
    category: 'address',
    description: 'Primary street address, city, state, or postal location',
    aliases: [
      'address',
      'street',
      'street address',
      'mailing address',
      'business address',
      'office address',
      'address 1',
      'billing address',
    ],
  },
  {
    key: 'shippingAddress',
    label: 'Secondary / Shipping Address',
    category: 'address',
    description: 'Secondary delivery location or site address',
    aliases: [
      'shipping address',
      'address 2',
      'secondary address',
      'site address',
      'delivery address',
    ],
  },
  {
    key: 'messagingHandle',
    label: 'Messaging Handle / Slack / Teams',
    category: 'contact_info',
    description: 'Instant messaging nickname, Teams email, or Slack handle',
    aliases: [
      'messaging handle',
      'slack',
      'teams',
      'im',
      'skype',
      'twitter',
      'chat',
      'handle',
    ],
  },
  {
    key: 'description',
    label: 'Notes / Bio / Description',
    category: 'metadata',
    description: 'Freeform notes, background history, or relationship summary',
    aliases: [
      'description',
      'notes',
      'note',
      'comments',
      'background',
      'bio',
      'details',
      'memo',
    ],
  },
];

export interface MigrationAppPreset {
  id: ImportSourceApp;
  title: string;
  vendor: string;
  iconBg: string;
  iconText: string;
  badge: string;
  description: string;
  defaultDelimiter: string;
  sampleFileName: string;
  exportInstructions: {
    stepTitle: string;
    stepDetails: string;
  }[];
  cautions?: string[];
  sampleData: string;
}

export const MIGRATION_PRESETS: MigrationAppPreset[] = [
  {
    id: 'outlook',
    title: 'Microsoft Outlook',
    vendor: 'Microsoft 365 / Office',
    iconBg: 'bg-blue-600',
    iconText: 'text-white',
    badge: 'Popular',
    description:
      'Export contacts directly from Outlook Desktop or Microsoft 365 Outlook on the Web as a CSV file.',
    defaultDelimiter: ',',
    sampleFileName: 'Outlook_Contacts_Export.csv',
    exportInstructions: [
      {
        stepTitle: '1. Open Outlook File Menu',
        stepDetails: 'In desktop Outlook, click on "File" in the top-left navigation ribbon, then select "Open & Export" > "Import/Export". In web Outlook, navigate to People > Manage contacts > Export contacts.',
      },
      {
        stepTitle: '2. Choose Export to a File',
        stepDetails: 'In the Import and Export Wizard, select "Export to a file" and click Next. When prompted for file format, choose "Comma Separated Values (CSV)".',
      },
      {
        stepTitle: '3. Select Contacts Folder & Save',
        stepDetails: 'Highlight your primary "Contacts" folder under your mailbox. Click Browse to pick a destination file (e.g., Outlook_Contacts.csv) and complete the wizard.',
      },
      {
        stepTitle: '4. Upload to CRM Wizard',
        stepDetails: 'Drag and drop the generated CSV file into Step 1 of this Migration tool to automatically parse headers.',
      },
    ],
    cautions: [
      'Outlook exports many empty fields (e.g., Telex, Pager, Car Phone). Our column mapper will automatically map relevant fields and ignore unneeded columns.',
      'Ensure "Save as type" is CSV (Comma Delimited), not PST or Outlook Data File.',
    ],
    sampleData: `First Name,Last Name,E-mail Address,Business Phone,Mobile Phone,Job Title,Company,Business Address,Notes
Richard,Hendricks,richard@piedpiper.io,+1 650-555-0144,+1 650-555-0145,Chief Executive Officer,Pied Piper,5230 Newell Rd Palo Alto CA,Founder and compression algorithm specialist
Dinesh,Chugtai,dinesh@piedpiper.io,+1 650-555-0188,,Lead Systems Architect,Pied Piper,5230 Newell Rd Palo Alto CA,Server infrastructure and distributed systems
Bertram,Gilfoyle,gilfoyle@piedpiper.io,+1 650-555-0199,+1 650-555-0190,Chief Security Officer,Pied Piper,5230 Newell Rd Palo Alto CA,Security network protocols and systems operations
Monica,Hall,monica@raviga.com,+1 415-555-0112,+1 415-555-0113,Managing Partner,Raviga Capital,101 California St San Francisco CA,Board member and venture capital investment lead`,
  },
  {
    id: 'palm',
    title: 'Palm Desktop',
    vendor: 'Palm Computing / Handspring',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    badge: 'Classic PIM',
    description:
      'Synchronize your handheld PDA, open Palm Desktop Address Book, and export records as standard CSV.',
    defaultDelimiter: ',',
    sampleFileName: 'Palm_AddressBook_Export.csv',
    exportInstructions: [
      {
        stepTitle: '1. Synchronize & Open Palm Desktop',
        stepDetails: 'Perform a HotSync operation with your Palm device to ensure desktop database is up to date, then launch Palm Desktop on your workstation.',
      },
      {
        stepTitle: '2. Navigate to Address Section',
        stepDetails: 'Click the Address icon in the Palm Desktop application sidebar to open your contacts list view.',
      },
      {
        stepTitle: '3. Select Contacts & Export',
        stepDetails: 'Select either all contacts or highlight specific records. Click "File" > "Export...". In the Export dialog, set "Export: All" (or "Currently selected records").',
      },
      {
        stepTitle: '4. Choose CSV Format & Export Fields',
        stepDetails: 'In "Type", select "Comma Separated Values (*.csv)". In the Specify Export Fields dialog, confirm Last Name, First Name, Title, Company, Work Phone, and E-mail are checked.',
      },
    ],
    cautions: [
      'Palm Desktop stores custom fields (Custom 1, Custom 2). Use our Column Mapping step to route custom fields to CRM notes or secondary attributes.',
      'Check date formats if birthdays or private category tags were enabled.',
    ],
    sampleData: `Last Name,First Name,Title,Company,Work,Home,Fax,Other,E-mail,Address,City,State,Zip,Custom 1
Sterling,Roger,Senior Partner,Sterling Cooper,+1 212-555-0110,,+1 212-555-0111,,roger@sterlingcooper.example.com,405 Madison Ave,New York,NY,10017,VIP Client
Draper,Don,Creative Director,Sterling Cooper,+1 212-555-0120,,+1 212-555-0121,,don.draper@sterlingcooper.example.com,405 Madison Ave,New York,NY,10017,Creative Lead
Campbell,Pete,Account Executive,Sterling Cooper,+1 212-555-0130,,+1 212-555-0131,,pete.c@sterlingcooper.example.com,405 Madison Ave,New York,NY,10017,Accounts Dept
Olson,Peggy,Copy Chief,Sterling Cooper,+1 212-555-0140,,+1 212-555-0141,,peggy.olson@sterlingcooper.example.com,405 Madison Ave,New York,NY,10017,Copywriting`,
  },
  {
    id: 'act',
    title: 'Act! CRM',
    vendor: 'Swiftpage / Act! LLC',
    iconBg: 'bg-amber-600',
    iconText: 'text-white',
    badge: 'CRM Platform',
    description:
      'Export contact records from Act! as a delimited text or CSV file with field names included.',
    defaultDelimiter: ',',
    sampleFileName: 'Act_Contacts_Export.csv',
    exportInstructions: [
      {
        stepTitle: '1. Launch Data Export in Act!',
        stepDetails: 'Open your Act! database. Click "File" on the main menu bar, then choose "Export...".',
      },
      {
        stepTitle: '2. Select Text Delimited File Type',
        stepDetails: 'In the Export Wizard, select "Text Delimited" as the file type you wish to export to, then click Next.',
      },
      {
        stepTitle: '3. Include Field Names as First Row',
        stepDetails: 'Under Options, make sure the checkbox "Yes, export first record as field names" is CHECKED. This ensures accurate column detection.',
      },
      {
        stepTitle: '4. Pick Target Fields & Export',
        stepDetails: 'Select Contact records. Map Contact, Company, Phone, Email, Title, and Address. Save as a .CSV or .TXT file and upload here.',
      },
    ],
    cautions: [
      'Always ensure "Yes, export field names" is selected in Act! so the wizard detects headers.',
      'Act! often splits contact names into a single "Contact" field or separate "First Name" and "Last Name". Our parser handles both!',
    ],
    sampleData: `Contact,Company,Title,Phone,Alt Phone,E-mail,Address 1,City,State,Zip,ID/Status
Dr. Michaela Quinn,Frontier Medical Clinic,Medical Director,+1 303-555-0165,+1 303-555-0166,dr.quinn@frontiermed.example.com,14 Colorado Springs Way,Colorado Springs,CO,80903,Active Customer
Sully Byron,Frontier Outfitters,Operations Manager,+1 303-555-0177,,sully@frontieroutfitters.example.com,82 Mountain Pass Road,Colorado Springs,CO,80903,Active Lead
Loren Bray,Bray Mercantile,Proprietor,+1 303-555-0188,,loren.bray@braymercantile.example.com,12 Main St,Colorado Springs,CO,80903,Vendor Partner`,
  },
  {
    id: 'goldmine',
    title: 'GoldMine CRM',
    vendor: 'Ivanti / GoldMine',
    iconBg: 'bg-yellow-600',
    iconText: 'text-slate-900',
    badge: 'Enterprise Legacy',
    description:
      'Use the GoldMine Import/Export Wizard to produce an ASCII/CSV file containing clean contact master records.',
    defaultDelimiter: ',',
    sampleFileName: 'GoldMine_Contacts_Export.csv',
    exportInstructions: [
      {
        stepTitle: '1. Open Import/Export Wizard',
        stepDetails: 'In GoldMine, click "Tools" on the top navigation bar, point to "Import/Export Records", and click "Export Contact Records".',
      },
      {
        stepTitle: '2. Select Export to ASCII / CSV File',
        stepDetails: 'Select "Export to a new file" and choose "ASCII file (comma-delimited or fixed-length)". Click Next.',
      },
      {
        stepTitle: '3. Select Contact Master Fields',
        stepDetails: 'Add fields from the Contact1 and Contact2 tables: Contact, Company, Phone1, Phone2, Title, Address1, City, State, Zip, and Ext.',
      },
      {
        stepTitle: '4. Warning: Exclude Unsupported Internal Fields',
        stepDetails: 'GoldMine contains internal binary/hex fields (e.g., RECN_ID, U_FIELD). Exclude proprietary binary fields and export only contact business information.',
      },
    ],
    cautions: [
      'CRITICAL WARNING: Do not export internal raw database indices (e.g. ACCOUNTNO, RECID, USERDEF). Filter only human-readable contact attributes.',
      'GoldMine stores email in a linked table; make sure Primary Email Address is included in the export mapping profile.',
    ],
    sampleData: `CONTACT,COMPANY,TITLE,PHONE1,PHONE2,EMAIL,ADDRESS1,CITY,STATE,ZIP,SOURCE
Gordon Gekko,Gekko & Co Holdings,Managing Partner,+1 212-555-0100,+1 212-555-0101,ggekko@gekkoholdings.example.com,55 Wall St,New York,NY,10005,GoldMine Master
Bud Fox,Stoneham Financial,Senior Broker,+1 212-555-0102,+1 212-555-0103,bfox@stonehamfin.example.com,140 Broadway,New York,NY,10005,Trade Desk
Carl Fox,Bluestar Airlines,Shop Steward,+1 718-555-0104,,cfox@bluestarair.example.com,Terminal 3 JFK Airport,Jamaica,NY,11430,Union Relations`,
  },
  {
    id: 'salesforce_contacts',
    title: 'Salesforce (Contacts)',
    vendor: 'Salesforce, Inc.',
    iconBg: 'bg-sky-600',
    iconText: 'text-white',
    badge: 'Cloud CRM',
    description:
      'Export Contacts from Salesforce Reports or Data Loader as CSV to migrate established customer accounts.',
    defaultDelimiter: ',',
    sampleFileName: 'Salesforce_Contacts_Report.csv',
    exportInstructions: [
      {
        stepTitle: '1. Run a Salesforce Contacts Report',
        stepDetails: 'Navigate to Reports tab in Salesforce. Create a new report on "Contacts & Accounts" or run an existing Contacts report.',
      },
      {
        stepTitle: '2. Select Clean Output Columns',
        stepDetails: 'Include Contact ID, First Name, Last Name, Account Name, Title, Email, Phone, Mobile, and Mailing Street.',
      },
      {
        stepTitle: '3. Export as Details Only (CSV)',
        stepDetails: 'Click the dropdown arrow next to Edit on the report view and select "Export". Choose "Details Only", select "Comma Delimited (.csv)", and click Export.',
      },
      {
        stepTitle: '4. Handle Duplicate Overlaps',
        stepDetails: 'If you are also importing Salesforce Leads, import Contacts first, then choose "Skip Duplicates" or "Update Existing" when importing Leads to prevent duplicate contacts.',
      },
    ],
    cautions: [
      'Account Name in Salesforce maps to Company in this CRM. If the company does not exist, our wizard can link it to your active default company.',
      'Export "Details Only" rather than "Formatted Report" to ensure raw CSV headers are clean without extraneous report title headers.',
    ],
    sampleData: `Contact ID,First Name,Last Name,Account Name,Title,Email,Phone,Mobile Phone,Mailing Street,Mailing City,Mailing State
0035000000XyZ1AAQ,Eleanor,Vance,CloudScale Networks,VP Architecture,e.vance@cloudscale.example.com,+1 415-555-8821,+1 415-555-8822,450 Mission St,San Francisco,CA
0035000000XyZ2BBQ,Julian,Bashir,BioVance Health Labs,Chief Medical Officer,j.bashir@biovance.example.com,+1 617-555-3310,+1 617-555-3311,100 Binney St,Cambridge,MA
0035000000XyZ3CCQ,Kira,Nerys,Nexus Logistics Group,Director of Operations,k.nerys@nexuslog.example.com,+1 312-555-4420,,233 S Wacker Dr,Chicago,IL`,
  },
  {
    id: 'salesforce_leads',
    title: 'Salesforce (Leads)',
    vendor: 'Salesforce, Inc.',
    iconBg: 'bg-indigo-600',
    iconText: 'text-white',
    badge: 'Pipeline Migration',
    description:
      'Export unconverted Leads from Salesforce to migrate prospective accounts into the new CRM pipeline.',
    defaultDelimiter: ',',
    sampleFileName: 'Salesforce_Leads_Report.csv',
    exportInstructions: [
      {
        stepTitle: '1. Run a Salesforce Leads Report',
        stepDetails: 'In Salesforce Reports, create a report on "Leads". Filter by "Converted equals False" to select active inbound leads.',
      },
      {
        stepTitle: '2. Select Relevant Lead Columns',
        stepDetails: 'Include Lead ID, First Name, Last Name, Company, Title, Email, Phone, Lead Status, and Rating.',
      },
      {
        stepTitle: '3. Export Details as CSV',
        stepDetails: 'Choose Export > Details Only > Comma Delimited (.csv). Save the resulting file.',
      },
      {
        stepTitle: '4. Duplicate Resolution with Contacts',
        stepDetails: 'Use our Step 5 Duplicate Handling rules (match by Email Address) to ensure leads that already exist as contacts in the CRM are skipped or updated.',
      },
    ],
    cautions: [
      'Leads that were already converted into Contacts in Salesforce should be filtered out to prevent duplicate entries.',
      'Our wizard automatically assigns the "lead" lifecycle type to records imported via this preset.',
    ],
    sampleData: `Lead ID,First Name,Last Name,Company,Title,Email,Phone,Lead Status,Rating,Street,City,State
00Q5000000AbC111,Harrison,Wells,S.T.A.R. Labs,Founder & Research Lead,harrison.wells@starlabs.example.com,+1 312-555-9081,Open - Not Contacted,Hot,200 Innovation Way,Central City,MO
00Q5000000AbC222,Caitlin,Snow,S.T.A.R. Labs,Director of Bio-Research,caitlin.snow@starlabs.example.com,+1 312-555-9082,Working - Contacted,Warm,200 Innovation Way,Central City,MO
00Q5000000AbC333,Cisco,Ramon,S.T.A.R. Labs,Chief Engineering Officer,cisco.ramon@starlabs.example.com,+1 312-555-9083,Open - Not Contacted,Hot,200 Innovation Way,Central City,MO`,
  },
  {
    id: 'generic_csv',
    title: 'Generic CSV / Excel Export',
    vendor: 'Universal Spreadsheet Format',
    iconBg: 'bg-slate-700',
    iconText: 'text-white',
    badge: 'Universal',
    description:
      'Import standard CSV or Tab-delimited files generated from Google Sheets, Microsoft Excel, LibreOffice, or custom databases.',
    defaultDelimiter: ',',
    sampleFileName: 'contacts_master_list.csv',
    exportInstructions: [
      {
        stepTitle: '1. Prepare Spreadsheet in Excel or Sheets',
        stepDetails: 'Ensure the first row contains descriptive column headers like First Name, Last Name, Email, and Phone.',
      },
      {
        stepTitle: '2. Save or Download as CSV',
        stepDetails: 'In Excel, choose "Save As" > "CSV (Comma delimited) (*.csv)". In Google Sheets, click "File" > "Download" > "Comma Separated Values (.csv)".',
      },
      {
        stepTitle: '3. Drag & Drop into Wizard',
        stepDetails: 'Upload your file or paste raw contents. The smart parser will identify headers and automatically match standard fields.',
      },
    ],
    sampleData: `First Name,Last Name,Email,Phone,Company,Job Title,Address,Type
Samantha,Carter,s.carter@stargate.mil,+1 719-555-0101,Stargate Command,Chief Technology Officer,Norad Complex Colorado Springs CO,customer
Daniel,Jackson,d.jackson@stargate.mil,+1 719-555-0102,Stargate Command,Head of Cultural Anthropology,Norad Complex Colorado Springs CO,lead
Jack,O'Neill,jack.oneill@stargate.mil,+1 719-555-0103,Stargate Command,Brigadier General,Norad Complex Colorado Springs CO,lead
Teal'c,Jaffa,tealc@chulak.example.com,+1 719-555-0104,Stargate Command,Senior Tactical Consultant,Norad Complex Colorado Springs CO,vendor`,
  },
];
