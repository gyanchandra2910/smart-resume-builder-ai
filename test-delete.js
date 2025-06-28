// Test script for delete functionality
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB connected');
    testDeleteEndpoint();
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

async function testDeleteEndpoint() {
    try {
        // First, let's see if there are any resumes
        const response = await fetch('http://localhost:5000/api/resume');
        const result = await response.json();
        
        console.log('📋 Current resumes:', result.data?.length || 0);
        
        if (result.data && result.data.length > 0) {
            const firstResume = result.data[0];
            console.log('🎯 Testing delete with resume:', firstResume._id, '-', firstResume.fullName);
            
            // Test delete
            const deleteResponse = await fetch(`http://localhost:5000/api/resume/${firstResume._id}`, {
                method: 'DELETE'
            });
            
            const deleteResult = await deleteResponse.json();
            console.log('🗑️ Delete result:', deleteResult);
            
            if (deleteResult.success) {
                console.log('✅ Delete functionality working!');
            } else {
                console.log('❌ Delete failed:', deleteResult.message);
            }
        } else {
            console.log('📝 No resumes found to delete. Create one first in the resume builder.');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
    
    process.exit(0);
}
