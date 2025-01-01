import express from 'express';
import { addAdmin,authenticateAdmin,adminLogin,deleteUserById } from '../controllers/adminController.js';

const AdminRouter = express.Router();

// Routes for user signup and login
AdminRouter.post('/signup', addAdmin);
AdminRouter.post('/login', adminLogin);
AdminRouter.delete('/delete/:id',deleteUserById)

// Example of a protected route
AdminRouter.get('/dashboard', authenticateAdmin, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});


export default AdminRouter;
