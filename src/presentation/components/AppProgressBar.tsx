import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { Colors } from '../theme';

interface ProgressBarProps {
    progress: number;     // 0 – 1 (vd: 0.5 = 50%)
    color?: string;       // fill color, mặc định lime
    trackColor?: string;  // track color, mặc định surf2
    height?: number;
    /** 'lime' | 'violet' | 'alert' — shorthand preset */
    preset?: 'lime' | 'violet' | 'alert';
}

/**
 * Thanh tiến trình theo design system Soleri.
 * Mặc định: lime fill, surf2 track, bo tròn hoàn toàn.
 */
export const AppProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    color,
    trackColor,
    height = 8,
    preset = 'lime',
}) => {
    const bounded = Math.min(Math.max(progress, 0), 1);
    const widthPct = `${bounded * 100}%` as DimensionValue;

    const presetColors: Record<string, string> = {
        lime:   Colors.lime,
        violet: Colors.violet,
        alert:  Colors.alert,
    };

    const fillColor  = color      ?? presetColors[preset];
    const trackBg    = trackColor ?? Colors.surf2;
    const radius     = height / 2;

    return (
        <View
            style={[
                styles.track,
                { backgroundColor: trackBg, height, borderRadius: radius },
            ]}
        >
            <View
                style={[
                    styles.fill,
                    { backgroundColor: fillColor, width: widthPct, borderRadius: radius },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
});
