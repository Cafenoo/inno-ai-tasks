// API Testing for Fake Store API
const API_URL = 'https://fakestoreapi.com/products';

async function testAPI() {
    try {
        // Make the API request
        const response = await fetch(API_URL);
        
        // Test 1: Verify server response code
        if (response.status !== 200) {
            console.error(`❌ Test Failed: Expected status code 200, got ${response.status}`);
            return;
        }
        console.log('✅ Test Passed: Server response code is 200');

        // Parse the response
        const products = await response.json();
        
        // Array to store products with defects
        const defectiveProducts = [];

        // Test each product
        products.forEach(product => {
            const defects = [];
            
            // Test 2: Check if title is empty
            if (!product.title || product.title.trim() === '') {
                defects.push('Empty title');
            }

            // Test 3: Check if price is negative
            if (product.price < 0) {
                defects.push('Negative price');
            }

            // Test 4: Check if rating.rate exceeds 5
            if (product.rating && product.rating.rate > 5) {
                defects.push('Rating exceeds 5');
            }

            // If any defects found, add to defective products list
            if (defects.length > 0) {
                defectiveProducts.push({
                    id: product.id,
                    title: product.title,
                    defects: defects
                });
            }
        });

        // Display results
        console.log('\n📊 Test Results:');
        console.log(`Total products tested: ${products.length}`);
        console.log(`Products with defects: ${defectiveProducts.length}`);

        if (defectiveProducts.length > 0) {
            console.log('\n🔍 Defective Products:');
            defectiveProducts.forEach(product => {
                console.log(`\nProduct ID: ${product.id}`);
                console.log(`Title: ${product.title}`);
                console.log('Defects:');
                product.defects.forEach(defect => console.log(`- ${defect}`));
            });
        } else {
            console.log('\n✅ No defective products found!');
        }

    } catch (error) {
        console.error('❌ Error during API testing:', error);
    }
}

// Run the tests
console.log('🚀 Starting API Tests...\n');
testAPI(); 
