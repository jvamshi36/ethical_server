const axios = require('axios');

const createDepartment = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/departments', {
      name: 'Sales',
      description: 'Sales and Marketing Department'
    });
    console.log('Department created:', response.data);
  } catch (error) {
    console.error('Error creating department:', error.response ? error.response.data : error.message);
  }
};

createDepartment();