import { NavLink } from 'react-router';
import clsx from 'clsx';

import styles from './MobileNavigation.module.css';

export const MobileNavigation = () => {
  return (
    <nav className={styles.navigation}>
      <NavLink
        to='/'
        end
        className={({ isActive }) =>
          clsx(styles.link, isActive && styles.linkActive)
        }
      >
        Episode
      </NavLink>
      <NavLink
        to='/library'
        className={({ isActive }) =>
          clsx(styles.link, isActive && styles.linkActive)
        }
      >
        Library
      </NavLink>
      <NavLink
        to='/study'
        className={({ isActive }) =>
          clsx(styles.link, isActive && styles.linkActive)
        }
      >
        Study
      </NavLink>
      <NavLink
        to='/settings'
        className={({ isActive }) =>
          clsx(styles.link, isActive && styles.linkActive)
        }
      >
        Settings
      </NavLink>
    </nav>
  );
};
