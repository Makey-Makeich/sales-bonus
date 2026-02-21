
/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    const discountCoefficient = 1 - (discount / 100);
    return sale_price * quantity * discountCoefficient;
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
   // Расчет бонуса от позиции в рейтинге
   if (index === 0) { // Первое место
    return seller.profit * 0.15; // 15% от прибыли
} else if (index === 1 || index === 2) { // Второе и третье место
    return seller.profit * 0.10; // 10% от прибыли
} else if (index === total - 1) { // Последнее место
    return 0; // 0% от прибыли
} else { // Все остальные
    return seller.profit * 0.05; // 5% от прибыли
}
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
   
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
        
     }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.id, item])); 
    const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => { 
        const seller = sellerIndex[record.seller_id]; 
        seller.sales_count += 1;
        seller.revenue += record.total_amount;

        record.items.forEach(item => {
            const product = productIndex[item.sku]; 
          
            const revenue = calculateSimpleRevenue(item, product);
            const cost = product.purchase_price * item.quantity;
            const profit = revenue - cost;
            seller.profit += profit;
            
         
          
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity; 
        });
    });

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((firstSeller, secondSeller) => {
        return secondSeller.profit - firstSeller.profit;
    });
    
    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        // Расчет бонуса
        seller.bonus = calculateBonusByProfit(index, sellerStats.length, seller);
        seller.top_products = Object.entries(seller.products_sold)
        .map(([sku, quantity]) => ({sku, quantity}))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    });

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
        seller_id: seller.id,// Строка, идентификатор продавца
        name: seller.name,// Строка, имя продавца
        revenue: +seller.revenue.toFixed(2),// Число с двумя знаками после точки, выручка продавца
        profit: +seller.profit.toFixed(2),// Число с двумя знаками после точки, прибыль продавца
        sales_count: seller.sales_count,// Целое число, количество продаж продавца
        top_products: seller.top_products,// Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
        bonus: +seller.bonus.toFixed(2)// Число с двумя знаками после точки, бонус продавца
    
})); 
}
