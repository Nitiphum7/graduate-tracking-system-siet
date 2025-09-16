// src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // import Context มาจากไฟล์เดิม

// สร้างและ export hook จากไฟล์นี้แทน
export const useAuth = () => {
    return useContext(AuthContext);
};