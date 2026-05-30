const FIELD_MAP = {
  bedrooms: ['beds', 'bedrooms', 'br', 'bed count'],
  bathrooms: ['baths', 'bathrooms', 'ba', 'bath count'],
  estimatedValue: ['est value', 'estimated value', 'avm', 'zillow estimate'],
  mortgageBalance: ['open mortgage balance', 'mortgage balance', 'loan balance', 'est mortgage balance'],
  preforeclosure: ['preforeclosure', 'pre-fc', 'pre-foreclosure', 'in foreclosure'],
  taxDelinquency: ['tax delinquent', 'delinquent taxes', 'tax default', 'back taxes'],
  absenteeOwner: ['absentee owner', 'absentee', 'non-owner occupied'],
  equity: ['equity', 'estimated equity', 'est equity'],
  lastSaleDate: ['last sale date', 'prior sale date', 'deed date'],
};

export function autoMapColumns(csvHeaders) {
  const mappings = {};
  csvHeaders.forEach(header => {
    const lower = header.toLowerCase().trim();
    for (const [systemField, variants] of Object.entries(FIELD_MAP)) {
      if (variants.includes(lower)) {
        mappings[header] = systemField;
        break;
      }
    }
  });
  return mappings;
}

export function applyMappings(row, mappings) {
  const result = {};
  Object.entries(row).forEach(([col, val]) => {
    const field = mappings[col] || col;
    result[field] = val;
  });
  return result;
}

export const SYSTEM_FIELDS = [
  'address', 'city', 'state', 'county', 'zip', 'owner',
  'arv', 'askPrice', 'mortgageBalance', 'repairEstimate',
  'bedrooms', 'bathrooms', 'sqft', 'yearBuilt', 'propertyType',
  'estimatedValue', 'rent', 'taxDelinquency', 'equity', 'lastSaleDate',
  'preforeclosure', 'absenteeOwner', 'vacant', 'auctionDate',
  'sellerMotivation', 'notes', '(skip)'
];
