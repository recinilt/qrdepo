//By Recep YENİ recepyeni@gmail.com


    const startButton = document.getElementById('start-btn');
    const readerDiv = document.getElementById('reader');
    const productTableBody = document.querySelector('#product-table tbody');
    const summaryTableBody = document.querySelector('#summary-table tbody');
    const shelfTableBody = document.querySelector('#shelf-table tbody');
    const shelfNameInput = document.getElementById('shelf-name');
    const saveShelfButton = document.getElementById('save-shelf-btn');
    const savedShelvesDiv = document.getElementById('saved-shelves');
    const downloadBtn = document.getElementById('download-btn');
    const uploadBtn = document.getElementById('upload-btn');
    let qrCodeScanner;

    // Başlangıçta ürün adlarını ve birim sayılarını depolamak için bir nesne "018699651521297":{name:"TROPISAL 0.5 MG+2,5 MG/2,5 ML NEBULIZASYON ICIN INHALASYON COZELTISI (20 FLAKON)",unitCount:1},
    //let productNames = {         "0108680760092235": { name: "Ibucold C 30 tb", unitCount: 30 }     }; //ilacgtinleri.js dosyasından bu değişken atanıyor.

    // Sanal tablo verilerini tutacak dizi
    let virtualTableData = [];

    // Local Storage'dan ürün adlarını ve birim sayılarını yükle
    function loadProductNames() {
      const storedNames = localStorage.getItem('productNames');
      if (storedNames) {
        const parsedNames = JSON.parse(storedNames);
        // HTML'deki varsayılan değerleri koruyarak güncelle
        productNames = { ...productNames, ...parsedNames };
      } else {
        // LocalStorage'de veri yoksa, başlangıç verilerini kullan
        localStorage.setItem('productNames', JSON.stringify(productNames));
      }
    }

    // Sayfa yüklendiğinde çalıştır
    loadProductNames();

    // Başlangıçta ve her raf kaydedildiğinde sanal tabloyu oluştur ve "Current Shelf" tablosunu güncelle
    function initializeVirtualTable() {
      virtualTableData = []; // Sanal tabloyu sıfırla
      updateCurrentShelf();
    }

    initializeVirtualTable(); // Sayfa yüklendiğinde ilklendir

    startButton.addEventListener('click', () => {
      if (!qrCodeScanner) {
        startScanning();
      }
    });


    function processScannedCode(decodedText) {
      // Attempt to split QR code by the delimiter
      const parts = decodedText.split('');
      if (parts.length >= 3) {
        const productCode = parts[1].slice(0, 16);
        const year = "20" + parts[2].slice(2, 4);
        const month = parts[2].slice(4, 6);
        // Geçerli tarihi al
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() 0-11 arası değer döndürür

        // SKT kontrolü
        if (year < currentYear || (year == currentYear && month < currentMonth)) {
            alert('Bu ürünün son kullanma tarihi geçmiş!');
        }

        const product = productNames[productCode] || { name: "Unknown Product", unitCount: 1 }; // Varsayılan olarak birim sayısı 1
        addProductToTable(productCode, year, month, product.name, decodedText, product.unitCount);
      } else {
        // Barkod için Product Code kısmına da barkodu yaz
        addProductToTable(decodedText, "N/A", "N/A", "Barcode", decodedText, 1);
      }
    }

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
            .map(([yearMonth, count]) => ` SKT: ${yearMonth}: ${count}`)
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


    function addProductToTable(productCode, year, month, productName, fullCode, unitCount = 1) {
      // Aynı tam QR/Barkod değerine sahip satır olup olmadığını kontrol et
      const existingRow = Array.from(productTableBody.rows).find(row => row.cells[4].textContent === fullCode);
  
      if (existingRow) {
          // Ürün zaten okutulmuşsa uyarı ver
          alert('Bu ürün zaten okutulmuş!');
          return; // Fonksiyonu sonlandır
      }
  
      
  
  const newRow = document.createElement('tr');
  const timestamp = new Date().getTime(); // Ürüne zaman damgası ekle
  
  // Silme butonu ekleme
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.style.backgroundColor = 'red';
  deleteButton.style.display = 'block';
  //const timestamp = new Date().getTime(); // Zaman damgası oluştur
  deleteButton.dataset.timestamp = timestamp; // Zaman damgasını butona ekle
  deleteButton.addEventListener('click', () => {
      deleteProductByTimestamp(timestamp); 
  });
  
  const deleteCell = document.createElement('td');
  deleteCell.appendChild(deleteButton);
  
  // Input ve buton ekleme
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Ürün adı girin';
  nameInput.value = productName;
  
  const unitCountInput = document.createElement('input');
  unitCountInput.type = 'number';
  unitCountInput.classList.add('unit-count');
  unitCountInput.placeholder = 'Birim sayısı';
  unitCountInput.value = unitCount;
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Kaydet';
  saveButton.addEventListener('click', () => {
      const newProductName = nameInput.value.trim();
      const newUnitCount = parseInt(unitCountInput.value) || 1;
      if (newProductName) {
          const productCell = newRow.cells[3];
          productCell.textContent = newProductName;
  
          productNames[productCode] = { name: newProductName, unitCount: newUnitCount };
          localStorage.setItem('productNames', JSON.stringify(productNames));
  
          // Sanal tabloyu güncelle (zaman damgasını da ekle)
          virtualTableData = virtualTableData.map(item => 
              item.timestamp === timestamp
                  ? { ...item, productName: newProductName, unitCount: newUnitCount, timestamp: timestamp } 
                  : item
          );
  
          updateSummaryTable();
          updateCurrentShelf();
      }
  });
  
  const actionsCell = document.createElement('td');
  actionsCell.appendChild(nameInput);
  actionsCell.appendChild(unitCountInput);
  actionsCell.appendChild(saveButton);
  
  newRow.innerHTML = `
      <td>${productCode}</td>
      <td>${year}</td>
      <td>${month}</td>
      <td>${productName}</td>
      <td>${fullCode}</td>
  `;
  
  newRow.appendChild(actionsCell);
  newRow.appendChild(deleteCell);
  
  productTableBody.appendChild(newRow);
  updateSummaryTable();
  
  // Sanal tabloya veri ekle (zaman damgasını da ekle) productCode, year, month, productName, fullCode, unitCount = 1
  virtualTableData.push({
      productCode,
      year,
      month,
      productName,
      unitCount,
      timestamp, // Zaman damgasını ekle
      fullCode
  });
  
  updateCurrentShelf();
  }
  
  function deleteProductByTimestamp(timestamp) {
  // 1. Tablodan silme
  const rows = Array.from(productTableBody.rows);
  rows.forEach(row => {
      // Zaman damgasını butonun data-timestamp özelliğinden al
      const rowTimestamp = row.cells[6].querySelector('button').dataset.timestamp; 
      if (rowTimestamp == timestamp) {
          const rowIndex = row.rowIndex;
          productTableBody.deleteRow(rowIndex - 1);
      }
  });
  
  // 2. ve 3. Tablolardan silme (sanal tablo üzerinden)
  virtualTableData = virtualTableData.filter(item => item.timestamp !== timestamp);
  
  // Tabloları güncelle
  updateSummaryTable();
  updateCurrentShelf();
  }
  










    // "Current Shelf" tablosunu güncelle
    function updateCurrentShelf() {
      const productSummary = {};

      // Sanal tablo verilerini kullanarak ürünleri grupla
      virtualTableData.forEach(item => {
        const { productCode, year, month, productName, unitCount, timestamp,fullCode } = item; //productCode, year, month, productName,  unitCount = 1, timestamp, fullcode
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
            .map(([yearMonth, count]) => ` SKT: ${yearMonth}: ${count}`)
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



    function sortTable() {
      const rows = Array.from(productTableBody.rows);
      rows.sort((a, b) => {
        const productA = a.cells[0].textContent;
        const productB = b.cells[0].textContent;
        

        if (productA === productB) {
          const yearA = a.cells[1].textContent;
          const yearB = b.cells[1].textContent;

          if (yearA === yearB) {
            const monthA = parseInt(a.cells[2].textContent);
            const monthB = parseInt(b.cells[2].textContent);
            return monthA - monthB;
          }

          return yearA.localeCompare(yearB);
        }

        return productA.localeCompare(productB);
      });

      productTableBody.innerHTML = '';
      rows.forEach(row => productTableBody.appendChild(row));
    }










    // Rafı kaydetme işlemi
    saveShelfButton.addEventListener('click', () => {
      const shelfName = shelfNameInput.value.trim();
      if (shelfName) {
        // Yeni bir tablo oluştur ve içeriği kopyala
        const newShelfTable = document.createElement('table');
        newShelfTable.innerHTML = `
                              <thead>
                                  <tr>
                                      <th>Product Name</th>
                                      <th>Total Count</th>
                                      <th>Total Unit Count</th>
                                      <th>Details (Year-Month: Count)</th>
                                  </tr>
                              </thead>
                              <tbody>${shelfTableBody.innerHTML}</tbody>
                              `;

        // Yeni tabloyu savedShelvesDiv'e ekle
        const shelfDiv = document.createElement('div');
        shelfDiv.innerHTML = `<h3>${shelfName}</h3>`;
        shelfDiv.appendChild(newShelfTable);
        savedShelvesDiv.appendChild(shelfDiv);

        // Raf tablosunu sıfırla ve sanal tabloyu yeniden başlat
        shelfTableBody.innerHTML = '';
        shelfNameInput.value = '';
        initializeVirtualTable();
      }
    });

    // Verileri indirme işlemi
    downloadBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productNames));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "product_data.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });

    // Verileri yükleme işlemi
    uploadBtn.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedData = JSON.parse(event.target.result);
          // Yüklenen verileri mevcut verilere ekle
          productNames = { ...productNames, ...loadedData };
          localStorage.setItem('productNames', JSON.stringify(productNames));
          // Tabloları güncelle
          updateSummaryTable();
          updateCurrentShelf();
        } catch (error) {
          console.error("Hata: Geçersiz JSON dosyası.", error);
          alert("Hata: Geçersiz JSON dosyası.");
        }
      }
      reader.readAsText(file);
    });



///////////////////////////////////
function startScanning() {
  readerDiv.style.display = 'block';
  startButton.disabled = true;

  qrCodeScanner = new Html5Qrcode("reader");
  qrCodeScanner.start(
    { facingMode: "environment" }, // Use the back camera
    {
      fps: 10,
      qrbox: 250,
    },
    (decodedText) => {
      stopScanning();
      processScannedCode(decodedText);
    },
    (errorMessage) => {
      console.log(`Scanning failed: ${errorMessage}`);
    }
  ).catch(err => {
    console.error(`Unable to start scanning: ${err}`);
    startButton.disabled = false;
  });
}

function stopScanning() {
  if (qrCodeScanner) {
    qrCodeScanner.stop().then(() => {
      qrCodeScanner.clear();
      qrCodeScanner = null;
      readerDiv.style.display = 'none';
      startButton.disabled = false;
    }).catch(err => {
      console.error(`Unable to stop scanning: ${err}`);
    });
  }
}


// Product Summary tablosunu Excel dosyası olarak indirme fonksiyonu
function downloadSummaryTable() {
  const ws = XLSX.utils.table_to_sheet(document.getElementById('summary-table'));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Product Summary');
  XLSX.writeFile(wb, 'product_summary.xlsx');
}

// Raf tablolarını Excel dosyası olarak indirme fonksiyonu
function downloadShelfTables() {
  const wb = XLSX.utils.book_new();
  const shelfDivs = savedShelvesDiv.querySelectorAll('div');
  shelfDivs.forEach((shelfDiv, index) => {
    const shelfName = shelfDiv.querySelector('h3').textContent;
    const shelfTable = shelfDiv.querySelector('table');
    const ws = XLSX.utils.table_to_sheet(shelfTable);
    XLSX.utils.book_append_sheet(wb, ws, shelfName || `Raf ${index + 1}`);
  });
  XLSX.writeFile(wb, 'raflar.xlsx');
}

// Butonlara event listener ekleme
document.getElementById('download-summary-btn').addEventListener('click', downloadSummaryTable);
document.getElementById('download-shelves-btn').addEventListener('click', downloadShelfTables);

