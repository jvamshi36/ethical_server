const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  fullName: Joi.string().min(3).max(100).required(),
  role: Joi.string().valid('BE', 'BM', 'SBM', 'ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN').required(),
  department: Joi.string().required(),
  headquarters: Joi.string().required(),
  reportingManagerId: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true)
});

// User update validation schema
const userUpdateSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().min(3).max(100).required(),
  role: Joi.string().valid('BE', 'BM', 'SBM', 'ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN').required(),
  department: Joi.string().required(),
  headquarters: Joi.string().required(),
  reportingManagerId: Joi.string().allow(null, ''), // Allow null and empty string
  isActive: Joi.boolean().default(true)
});

// Login validation schema
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Daily allowance validation schema
const dailyAllowanceSchema = Joi.object({
  date: Joi.date().required(),
  amount: Joi.number().positive().required(),
  remarks: Joi.string().allow(null, '')
});

// Travel allowance validation schema
const travelAllowanceSchema = Joi.object({
  date: Joi.date().required(),
  fromCity: Joi.string().required(),
  toCity: Joi.string().required(),
  distance: Joi.number().positive().required(),
  travelMode: Joi.string().required(),
  amount: Joi.number().positive().required(),
  remarks: Joi.string().allow(null, '')
});

// Status update validation schema
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required()
});

// City validation schema
const citySchema = Joi.object({
  name: Joi.string().required(),
  state: Joi.string().required(),
  headquarters: Joi.string().required(),
  isActive: Joi.boolean().default(true)
});

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    next();
  };
};

module.exports = {
  validateUser: validate(userSchema),
  validateUserUpdate: validate(userUpdateSchema),
  validateLogin: validate(loginSchema),
  validateDailyAllowance: validate(dailyAllowanceSchema),
  validateTravelAllowance: validate(travelAllowanceSchema),
  validateStatusUpdate: validate(statusUpdateSchema),
  validateCity: validate(citySchema)
};