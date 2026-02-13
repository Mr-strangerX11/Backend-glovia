const axios = require('axios');

const API_URL = 'https://backend-glovia.vercel.app/api/v1';

async function waitForDeployment() {
  console.log('Waiting for Vercel deployment to complete...');
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.put(
        `${API_URL}/admin/products/698faa3c7ef2a4e5f87ad0c6`,
        { isNewProduct: true },
        {
          headers: {
            'Authorization': `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        console.log('✅ Deployment complete! isNewProduct field accepted');
        return true;
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('property isNewProduct should not exist')) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts}: Still deploying...`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } else {
        console.error('Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  }
  
  console.log('⏱️ Deployment taking longer than expected. Please try again in a few minutes.');
  return false;
}

async function getToken() {
  const loginResponse = await axios.post(`${API_URL}/auth/login`, {
    email: 'superadmin@glovia.com.np',
    password: 'SuperAdmin123!',
  });
  return loginResponse.data.accessToken;
}

async function updateProduct() {
  console.log('Checking deployment status...\n');
  
  const deployed = await waitForDeployment();
  
  if (!deployed) {
    console.log('\n⚠️  Manual update required after deployment completes.');
    console.log('Run this script again in a few minutes.');
    return;
  }

  try {
    const token = await getToken();
    
    console.log('\nUpdating product with all details...');
    const response = await axios.put(
      `${API_URL}/admin/products/698faa3c7ef2a4e5f87ad0c6`,
      {
        isNewProduct: true,
        discountPercentage: 5,
        images: ['https://images-static.nykaa.com/media/catalog/product/0/c/0c0ef1edermac00000105-1_1.jpg'],
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('\n✅ Product updated successfully!');
    console.log('Product:', response.data.name);
    console.log('New Product:', response.data.isNewProduct);
    console.log('Discount:', response.data.discountPercentage + '%');
    console.log('Images:', response.data.images?.length || 0);
    
    // Verify it shows in category
    console.log('\nVerifying product appears in Skincare category...');
    const categoryResponse = await axios.get(`${API_URL}/products`, {
      params: { categoryId: '698f7f92077f39ad60a91c3c' }
    });
    
    const found = categoryResponse.data.data.find(p => p._id === '698faa3c7ef2a4e5f87ad0c6');
    if (found) {
      console.log('✅ Product now appears in Skincare category!');
    } else {
      console.log('⚠️  Product not yet visible in category. May need a moment to index.');
    }
    
    console.log('\n🎉 All done! Product is ready.');
    console.log('View at: https://glovia.com.np/products/derma-facewash');
    
  } catch (error) {
    console.error('\n❌ Error updating product:', error.response?.data || error.message);
  }
}

updateProduct();
