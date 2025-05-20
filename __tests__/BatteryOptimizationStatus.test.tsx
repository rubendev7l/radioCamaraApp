import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { BatteryOptimizationStatus } from '../components/BatteryOptimizationStatus';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';

jest.mock('../hooks/useBatteryOptimization');

describe('BatteryOptimizationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render on non-Android platforms', () => {
    Platform.OS = 'ios';
    const { queryByTestId } = render(<BatteryOptimizationStatus />);
    expect(queryByTestId('battery-optimization-status')).toBeNull();
  });

  it('should not render while checking', () => {
    Platform.OS = 'android';
    (useBatteryOptimization as jest.Mock).mockReturnValue({
      isOptimized: false,
      isChecking: true,
    });
    const { queryByTestId } = render(<BatteryOptimizationStatus />);
    expect(queryByTestId('battery-optimization-status')).toBeNull();
  });

  it('should render warning when optimized', () => {
    Platform.OS = 'android';
    (useBatteryOptimization as jest.Mock).mockReturnValue({
      isOptimized: true,
      isChecking: false,
    });
    const { getByText, getByTestId } = render(<BatteryOptimizationStatus />);
    expect(getByTestId('battery-optimization-status')).toBeTruthy();
    expect(getByText('Modo economia de bateria pode interromper a reprodução')).toBeTruthy();
  });

  it('should render success when not optimized', () => {
    Platform.OS = 'android';
    (useBatteryOptimization as jest.Mock).mockReturnValue({
      isOptimized: false,
      isChecking: false,
    });
    const { getByText, getByTestId } = render(<BatteryOptimizationStatus />);
    expect(getByTestId('battery-optimization-status')).toBeTruthy();
    expect(getByText('Otimização de bateria desativada')).toBeTruthy();
  });
}); 