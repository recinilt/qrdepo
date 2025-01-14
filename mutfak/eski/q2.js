        // Raf tablosunu güncellemek için ayrı bir fonksiyon
        function updateShelfTable(productCode, year, month, productName, unitCount = 1) {
            const yearMonth = `${year}-${month}`;
            let existingRow = null;

            // Aynı ürün varsa satırı bul, productCode'a göre arama yap
            for (let i = 0; i < shelfTableBody.rows.length; i++) {
                const row = shelfTableBody.rows[i];
                // Ürün kodunu hücrenin içindeki input'un value değerinden al
                const rowProductCode = row.cells[0].querySelector('input').value; 
                if (rowProductCode === productCode) {
                    existingRow = row;
                    break;
                }
            }

            if (existingRow) {
                // Toplam sayıyı ve birim sayısını güncelle
                const totalCountCell = existingRow.cells[1];
                totalCountCell.textContent = parseInt(totalCountCell.textContent) + 1;

                const totalUnitCountCell = existingRow.cells[2];
                totalUnitCountCell.textContent = parseInt(totalUnitCountCell.textContent) + unitCount;

                // Detayları güncelle
                const detailsCell = existingRow.cells[3];
                const detailsText = detailsCell.textContent;
                const detailParts = detailsText.split(', ');
                let yearMonthFound = false;

                for (let i = 0; i < detailParts.length; i++) {
                    if (detailParts[i].startsWith(yearMonth)) {
                        const [ym, count] = detailParts[i].split(': ');
                        detailParts[i] = `${ym}: ${parseInt(count) + 1}`;
                        yearMonthFound = true;
                        break;
                    }
                }

                if (!yearMonthFound) {
                    detailParts.push(`${yearMonth}: 1`);
                }

                detailsCell.textContent = detailParts.join(', ');

                // Ürün adını güncelle (eğer değiştiyse)
                const productNameCell = existingRow.cells[0];
                productNameCell.textContent = productName; 
            } else {
                // Yeni satır oluştur
                const newRow = document.createElement('tr');
                // Input ekle ve değerini ayarla
                const nameInput = document.createElement('input');
                nameInput.type = 'hidden'; // Gizli input olarak ekle
                nameInput.value = productCode; // Input'un değerine productCode'u ata
                newRow.innerHTML = `
                    <td>${productName}</td> 
                    <td>1</td>
                    <td>${unitCount}</td>
                    <td>${yearMonth}: 1</td>
                `;
                // Hücrenin başına input'u ekle
                newRow.cells[0].insertBefore(nameInput, newRow.cells[0].firstChild); 
                shelfTableBody.appendChild(newRow);
            }
        }
