/**
 * Core Web Vitals Context
 * Separated from components to fix React Fast Refresh warnings
 */

import React from 'react';
import { CoreWebVitalsContextType } from '../types/coreWebVitals';

/**
 * Core Web Vitals Context
 */
export const CoreWebVitalsContext = React.createContext<CoreWebVitalsContextType | null>(null);
