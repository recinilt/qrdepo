function updateCurrentShelf() {
    const productSummary = {};

    // Sanal tablo verilerini kullanarak ürünleri grupla
    virtualTableData.forEach(item => {
      const { productCode, year, month, productName, unitCount } = item;
      const yearMonth = `${year}-${month}`;

      if (!productSummary[productName]) {
        productSummary[productName] = { total: 0, totalUnits: 0, details: {} };
      }

      productSummary[productName].total += 1;
      productSummary[productName].totalUnits += unitCount;

      if (!productSummary[productName].details[yearMonth]) {
        productSummary[productName].details[yearMonth] = 0;
      }

      productSummary[productName].details[yearMonth] += 1;
    });

    // Tabloyu doldur
    shelfTableBody.innerHTML = '';

    Object.keys(productSummary)
      .sort()
      .forEach(productName => {
        const product = productSummary[productName];
        const detailStrings = Object.entries(product.details)
          .map(([yearMonth, count]) => `${yearMonth}: ${count}`)
          .join(', ');

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                            <td>${productName}</td> 
                            <td>${product.total}</td>
                            <td>${product.totalUnits}</td>
                            <td>${detailStrings}</td>
                            `;
        shelfTableBody.appendChild(newRow);
      });
  }
