import { Outlet } from '@modern-js/runtime/router';
import '../css/index.css';

import ContextProvider from './component/context/Context';

export default function Layout() {
  return (
    <div>
      <ContextProvider>
        <Outlet />
      </ContextProvider>
    </div>
  );
}
