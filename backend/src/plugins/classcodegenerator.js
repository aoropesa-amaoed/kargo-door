export const classCodeGenerator = (originCountry, destinationCountry, shipmentType) => {
    let quoteClassCode = 'RK';
    if (originCountry === 'PH' && destinationCountry === 'PH') {
      if (shipmentType.includes('road')) {
        quoteClassCode = 'RK0724';
      } else if (shipmentType.includes('air') || shipmentType.includes('sea')) {
        quoteClassCode = 'RK0721';
      }
    } else if (originCountry === 'PH') {
      quoteClassCode = 'RK0718';
    } else {
      quoteClassCode = 'RK0715';
    }
    return quoteClassCode;
}