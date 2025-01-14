function updateSummaryTable() {
    const rows = Array.from(productTableBody.rows);
    const productSummary = {};


    // Ürünleri gruplama
    rows.forEach(row => {
      const productName = row.cells[3].textContent; 
      
      const year = row.cells[1].textContent;
      const month = row.cells[2].textContent;
      const unitCount = parseInt(row.cells[5].querySelector('.unit-count').value) || 1; // Birim sayısını al
      const yearMonth = `${year}-${month}`;

      if (!productSummary[productName]) {
        productSummary[productName] = { total: 0, totalUnits: 0, details: {} };
      }

      productSummary[productName].total += 1;
      productSummary[productName].totalUnits += unitCount; // Birim sayısını toplama ekle

      if (!productSummary[productName].details[yearMonth]) {
        productSummary[productName].details[yearMonth] = 0;
      }

      productSummary[productName].details[yearMonth] += 1;
    });

    // Tabloyu doldurma
    summaryTableBody.innerHTML = '';

    Object.keys(productSummary)
      .sort() // Alfabetik sıralama
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

        summaryTableBody.appendChild(newRow);
      });
  }
