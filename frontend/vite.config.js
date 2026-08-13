import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], server: { port: 5173 }, build: { rollupOptions: { input: { login: resolve(__dirname,'index.html'), admin: resolve(__dirname,'admin.html'), faculty: resolve(__dirname,'faculty.html'), academicCoordinator: resolve(__dirname,'academic-coordinator.html'), student: resolve(__dirname,'student.html'), studentCoordinator: resolve(__dirname,'student-coordinator.html') } } } });
