import React from 'react';
import { Outlet } from 'react-router-dom';
import LayoutComponent from '../../components/layout/Layout';

export default function Layout() {
    return (
        <LayoutComponent>
            <Outlet />
        </LayoutComponent>
    );
}
