import {fetchShoppingCartList, updateProductQuantity, deleteProduct} from "./cartApi.js";

const selectAllCheckbox = document.getElementById('select-all');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

selectAllCheckbox.addEventListener('change', function() {
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    calculateTotal();  // 全選時重新計算總額
});

async function getShoppingCartList(userId) {
    try {
        const data = await fetchShoppingCartList(userId);

        document.getElementById('allSchedule').innerHTML='';


        data.forEach(item => {
            console.log(item);
            const{productList,supplierId,supplierName,quantity} = item;

            const shop = document.createElement('div');
            shop.setAttribute('id', `data-supplier-${supplierId}`);
            document.getElementById('allSchedule').append(shop);

            const supplierDiv = document.createElement('div');
            supplierDiv.className = 'schedule';
            supplierDiv.innerHTML=`<input data-supplier-id="${supplierId}" type="checkbox" id="store-a-checkbox" onclick="toggleStoreItems(${supplierId}, this)">
                    <label for="store-a-checkbox" class="mall-label">${supplierName}</label> 預計取貨時間：2024/11/25`;
            shop.append(supplierDiv);

            productList.forEach(product =>{
                const{productId,productName,productSpec,picture,price,quantity} = product;

                let totalPrice = quantity * price;
                const element = document.createElement('div');
                element.className = 'cart-item row store-b';
                element.innerHTML = `
                <div class="col-md-1">
                    <input data-product-id=${productId} data-supplier-id="${supplierId}" type="checkbox" class="store-b-checkbox item-checkbox" onclick="calculateTotal()">
                </div>
                <div class="col-md-2">
                    <img src="https://via.placeholder.com/100" alt="商品100" class="img-fluid">
                </div>
                <div class="col-md-5">
                    <h5>${productName}</h5>
                    <h6>${productSpec}</h6>
                </div>
                <div data-price="${price}" class="col-md-2">${price}</div>
                <div class="col-md-2 quantity-control">
                    <button class="btn btn-outline-secondary" data-product-id=${productId}  onclick="decreaseQuantity(this)">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="btn btn-outline-secondary" data-product-id=${productId} onclick="increaseQuantity(this)">+</button>
                    <button class="remove-btn" data-product-id=${productId} onclick="removeItem(this)">移除</button>
                </div>
`;

                shop.append(element);
            })
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


// 增加數量的功能
function increaseQuantity(button) {

    const quantityElement = button.previousElementSibling;
    let quantity = parseInt(quantityElement.textContent);
    quantity++;
    quantityElement.textContent = quantity;

    const productId = button.getAttribute('data-product-id');  // 獲取商品 ID
    updateProductQuantity(fakUserId, productId, quantity);  // 更新購物車中的商品數量
    calculateTotal();  // 每次數量變更時重新計算總額
}

// 減少數量的功能
function decreaseQuantity(button) {
    const quantityElement = button.nextElementSibling;
    let quantity = parseInt(quantityElement.textContent);
    const productId = button.getAttribute('data-product-id');  // 獲取商品

    // 確保數量不能小於 1
    if (quantity > 1) {
        quantity--; // 減少數量
        quantityElement.textContent = quantity; // 更新數量顯示
        updateProductQuantity(fakUserId, productId, quantity);
    } else {
        // 如果商品數量已經是1，提示用戶是否要刪除商品
        if (confirm('商品數量為 1，是否要從購物車中移除？')) {
            updateProductQuantity(fakUserId, productId, quantity);
            removeItem(button); // 呼叫移除商品的函數
        }
    }

    calculateTotal(); // 每次數量變更後，重新計算總金額
}


// 計算總計金額
function calculateTotal() {
    let total = 0;
    const selectedItems = document.querySelectorAll('.item-checkbox:checked');
    selectedItems.forEach(item => {
        console.log(item);
        const cartItem = item.closest('.cart-item');
        const price = parseFloat(cartItem.querySelector('[data-price]').dataset.price);
        const quantity = parseInt(cartItem.querySelector('.quantity').textContent);
        total += price * quantity;
    });
    console.log("目前總金額:",total);
    document.getElementById('total-amount').textContent = total.toFixed(2);
}

//前端連接api
function putItemIntoCart(userId,productId,quantity){
    const apiUrl = `http://localhost:8080/api/cart/update?userId=${userId}&productId=${productId}&quantity=${quantity}`;
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('購物車更新成功！');
            console.log(data);
        })
        .catch(error => {
            alert('更新失敗：' + error.message);
            console.error('There was an error!', error);
        });
}


// 移除商品後更新界面
function removeItem(button) {
    const productId = button.getAttribute('data-product-id');  // 獲取商品
    const productElement = button.closest('.cart-item');

    if (productElement) {
        // 從 UI 中移除該商品
        productElement.remove();

        // 調用你的後端 API 刪除商品
        deleteProduct(fakUserId, productId);

    } else {
        console.error('Product element not found.');
    }
    calculateTotal();
}


// "全選" 按鈕的功能
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const allCheckboxes = document.querySelectorAll('.item-checkbox');

    allCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;  // 將每個產品的 checkbox 狀態設置為與 "全選" checkbox 相同
    });

    calculateTotal();  // 每次全選後重新計算總額
}

// 切換商城商品的選擇狀態
function toggleStoreItems(supplierId, storeCheckbox) {
    const storeItems = document.querySelectorAll(`[data-supplier-id="${supplierId}"]`);

    storeItems.forEach(item => {
        item.checked = storeCheckbox.checked;
    });

    calculateTotal();  // 切換商店勾選時重新計算總額
}

function getCheckoutItems() {
    const selectedItems = document.querySelectorAll('.item-checkbox:checked'); // 選取所有勾選的項目

    if (selectedItems.length === 0) {
        alert('請選擇要結帳的商品');
        return;
    }


    selectedItems.forEach(item => {
        const cartItem = item.closest('.cart-item'); // 找到對應的商品元素
        const productId = item.getAttribute('data-product-id'); // 從 checkbox 中取得商品 ID
        const quantity = parseInt(cartItem.querySelector('.quantity').textContent); // 取得商品數量
        const price = parseFloat(cartItem.querySelector('[data-price]').dataset.price); // 取得商品價格

        checkoutItems.push({
            productId: productId,
            quantity: quantity,
            price: price
        });
    });

    console.log('被勾選的商品：', checkoutItems);
}


let currentStep = 1;

function nextStep(step) {
    document.getElementById(`step${currentStep}`).classList.add('d-none');
    document.getElementById(`step${step}`).classList.remove('d-none');
    currentStep = step;
    updateProgressBar();
}

function previousStep(step) {
    document.getElementById(`step${currentStep}`).classList.add('d-none');
    document.getElementById(`step${step}`).classList.remove('d-none');
    currentStep = step;
    updateProgressBar();
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const steps = 2;
    const percentage = (currentStep / steps) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `Step ${currentStep} of ${steps}`;
}

function openModal() {
    var orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
}

function submitOrder() {
    // 假設後端傳回的訂單商品資料
    const orderItems = [
        { name: '男士排汗衣', quantity: 2, subtotal: 1000 },
        { name: '超暖的帽子', quantity: 1, subtotal: 500 },
        { name: '籃球', quantity: 1, subtotal: 500 }
    ];

    // 抓取表單中的數據
    const customerName = document.getElementById("customerName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    // 動態更新Modal中的內容
    document.getElementById("modalCustomerName").textContent = customerName;
    document.getElementById("modalEmail").textContent = email;
    document.getElementById("modalPhone").textContent = phone;
    document.getElementById("modalAddress").textContent = address;

    // 更新商品明細表格
    let orderItemsTable = document.getElementById("orderItems");
    orderItemsTable.innerHTML = ''; // 清空表格內容
    orderItems.forEach(item => {
        const row = `<tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.subtotal}</td>
                            </tr>`;
        orderItemsTable.innerHTML += row;
    });
}


window.openModal =openModal
window.submitOrder = submitOrder;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.updateProgressBar = updateProgressBar;
window.getCheckoutItems = getCheckoutItems;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeItem = removeItem;
window.toggleStoreItems = toggleStoreItems;
window.toggleSelectAll = toggleSelectAll;
window.calculateTotal = calculateTotal;

// 當頁面加載時執行
window.onload = function() {
    getShoppingCartList(fakUserId);
};