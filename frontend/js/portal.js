import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleDashboard } from '../src/RoleDashboards.jsx';
import '../css/admin.css';

export const paths={admin:'/admin.html',faculty:'/faculty.html',academic_coordinator:'/academic-coordinator.html',student:'/student.html',student_coordinator:'/student-coordinator.html'};
export function mountDashboard(expectedRole){
  function Page(){
    const [session,setSession]=useState(()=>{try{return JSON.parse(localStorage.getItem('gvpcew_session')||'null')}catch{return null}});
    const roles=session?.user?.roles||session?.roles||[session?.user?.role||session?.role].filter(Boolean);
    const [active,setActive]=useState('Dashboard');
    if(!session){window.location.replace('/index.html');return null;}
    if(!roles.includes(expectedRole)){window.location.replace(paths[roles[0]]||'/index.html');return null;}
    const logout=()=>{localStorage.removeItem('gvpcew_session');window.location.replace('/index.html');};
    const changeRole=role=>{if(roles.includes(role))window.location.assign(paths[role]);};
    return React.createElement(RoleDashboard,{role:expectedRole,name:session.user?.fullName||'GVPCEW User',active,onNavigate:setActive,onLogout:logout,onRoleChange:changeRole,roles});
  }
  createRoot(document.getElementById('root')).render(React.createElement(Page));
}
