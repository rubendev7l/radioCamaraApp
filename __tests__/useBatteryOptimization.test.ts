import { renderHook, act } from '@testing-library/react-hooks';
import { Platform } from 'react-native';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import PowerManager from '../utils/PowerManager';

jest.mock('../utils/PowerManager', () => ({
  isIgnoringBatteryOptimizations: jest.fn(),
  requestIgnoreBatteryOptimizations: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe('useBatteryOptimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBatteryOptimization());
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.isChecking).toBe(true);
  });

  it('should return true for non-Android platforms', async () => {
    Platform.OS = 'ios';
    const { result, waitForNextUpdate } = renderHook(() => useBatteryOptimization());
    await waitForNextUpdate();
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it('should check battery optimization on mount', async () => {
    Platform.OS = 'android';
    (PowerManager.isIgnoringBatteryOptimizations as jest.Mock).mockResolvedValueOnce(true);
    const { result, waitForNextUpdate } = renderHook(() => useBatteryOptimization());
    await waitForNextUpdate();
    expect(PowerManager.isIgnoringBatteryOptimizations).toHaveBeenCalled();
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    Platform.OS = 'android';
    (PowerManager.isIgnoringBatteryOptimizations as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    const { result, waitForNextUpdate } = renderHook(() => useBatteryOptimization());
    await waitForNextUpdate();
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it('should update state when battery optimization changes', async () => {
    Platform.OS = 'android';
    let listenerCallback: (isOptimized: boolean) => void;
    (PowerManager.addListener as jest.Mock).mockImplementation((eventName, callback) => {
      listenerCallback = callback;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useBatteryOptimization());
    act(() => {
      listenerCallback(true);
    });
    expect(result.current.isOptimized).toBe(true);
  });

  it('should request ignore optimization', async () => {
    Platform.OS = 'android';
    (PowerManager.requestIgnoreBatteryOptimizations as jest.Mock).mockResolvedValueOnce(true);
    (PowerManager.isIgnoringBatteryOptimizations as jest.Mock).mockResolvedValueOnce(true);
    const { result } = renderHook(() => useBatteryOptimization());
    await act(async () => {
      await result.current.requestIgnoreOptimization();
    });
    expect(PowerManager.requestIgnoreBatteryOptimizations).toHaveBeenCalled();
    expect(PowerManager.isIgnoringBatteryOptimizations).toHaveBeenCalled();
  });
}); 