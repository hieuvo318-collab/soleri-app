import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { createProfile, updateProfile } from '../../data/local/dao';
import { IProfile } from '../../core/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Synced with constants/theme.ts — Lime neon · Dark mode · Radius 20/36
const C = {
    bg:         '#0F1115',   // Palette.bg
    surface:    '#1A1D23',   // Palette.surface
    surfaceUp:  '#22262E',   // Palette.surf2
    border:     '#22262E',   // Palette.surf2
    lime:       '#D7FF5B',   // Palette.lime
    limeDim:    '#B8D940',
    text:       '#FFFFFF',   // Palette.text
    muted:      '#6B7280',   // Palette.muted
    mutedLight: '#9CA3AF',
    red:        '#FB923C',   // Palette.alert
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTIVITY_MULTIPLIER: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
};

const ACTIVITY_OPTIONS = [
    { key: 'sedentary', label: 'Desk job, no gym', emoji: '🪑' },
    { key: 'light', label: 'Light (1–2×/wk)', emoji: '🚶' },
    { key: 'moderate', label: 'Moderate (3–4×/wk)', emoji: '🏋️' },
    { key: 'active', label: 'Active (5–6×/wk)', emoji: '🏃' },
    { key: 'very-active', label: 'Athlete / daily', emoji: '🔥' },
];

type ActivityKey = keyof typeof ACTIVITY_MULTIPLIER;

// ─── NumericStepper Component ─────────────────────────────────────────────────
interface StepperProps {
    value: string;
    onChange: (v: string) => void;
    min?: number;
    max?: number;
    step?: number;
    defaultVal?: number;
    placeholder?: string;
    style?: object;
    flex?: number;
}

const Stepper: React.FC<StepperProps> = ({
    value,
    onChange,
    min = 0,
    max = 9999,
    step = 1,
    defaultVal = 4,
    placeholder,
    style,
    flex,
}) => {
    const increment = () => {
        const cur = parseFloat(value);
        if (isNaN(cur)) {
            onChange(String(defaultVal));
            return;
        }
        const next = Math.min(Math.round((cur + step) * 100) / 100, max);
        onChange(String(next));
    };

    const decrement = () => {
        const cur = parseFloat(value);
        if (isNaN(cur)) {
            onChange(String(defaultVal));
            return;
        }
        const next = Math.max(Math.round((cur - step) * 100) / 100, min);
        onChange(String(next));
    };

    const containerStyle = [
        s.stepperWrap,
        flex !== undefined && { flex },
        style,
    ].filter(Boolean);

    return (
        <View style={containerStyle}>
            <TouchableOpacity style={s.stepBtn} onPress={decrement} activeOpacity={0.7}>
                <Text style={s.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
                style={s.stepInput}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                textAlign="center"
                placeholder={placeholder ?? '—'}
                placeholderTextColor={C.muted}
            />
            <TouchableOpacity style={s.stepBtn} onPress={increment} activeOpacity={0.7}>
                <Text style={s.stepBtnText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface OnboardingProps {
    onComplete: (profile: IProfile) => void;
    initialProfile?: IProfile;
    onCancel?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
    onComplete,
    initialProfile,
    onCancel,
}) => {
    const isEditing = !!initialProfile;

    // ── State ──────────────────────────────────────────────────────────────
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [heightFt, setHeightFt] = useState<string>('');
    const [heightIn, setHeightIn] = useState<string>('');
    const [currentWeightLbs, setCurrentWeightLbs] = useState<string>('');
    const [targetWeightLbs, setTargetWeightLbs] = useState<string>('');
    const [zip, setZip] = useState<string>('');
    const [weeklyBudget, setWeeklyBudget] = useState<string>('');
    const [activityLevel, setActivityLevel] = useState<ActivityKey>('moderate');
    const [dietTags, setDietTags] = useState<string[]>([]);
    const [cuisineTags, setCuisineTags] = useState<string[]>([]);

    const [step, setStep] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Location
    const [isDetecting, setIsDetecting] = useState(false);
    const [locationDetected, setLocationDetected] = useState(false);
    const [detectedZipLabel, setDetectedZipLabel] = useState('');

    // ── Load metadata when editing ─────────────────────────────────────────
    useEffect(() => {
        if (!isEditing) return;
        const load = async () => {
            try {
                const raw = await AsyncStorage.getItem('soleri_user_metadata');
                if (!raw) return;
                const meta = JSON.parse(raw);
                if (meta.name) setName(meta.name);
                if (meta.age) setAge(String(meta.age));
                if (meta.heightFt) setHeightFt(String(meta.heightFt));
                if (meta.heightIn !== undefined) setHeightIn(String(meta.heightIn));
                if (meta.zip) setZip(meta.zip);
                if (meta.weeklyBudget) setWeeklyBudget(String(meta.weeklyBudget));
                if (meta.currentWeightLbs) setCurrentWeightLbs(String(meta.currentWeightLbs));
                if (meta.targetWeightLbs) setTargetWeightLbs(String(meta.targetWeightLbs));
                if (meta.activity && ACTIVITY_MULTIPLIER[meta.activity]) {
                    setActivityLevel(meta.activity as ActivityKey);
                }
                if (Array.isArray(meta.diet)) setDietTags(meta.diet);
                if (Array.isArray(meta.cuisine)) setCuisineTags(meta.cuisine);
            } catch (e) {
                console.warn('Could not load saved metadata:', e);
            }
        };
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const showAlert = (msg: string) => {
        if (Platform.OS === 'web') {
            window.alert(msg);
        } else {
            Alert.alert('Notice', msg);
        }
    };

    const toggleTag = (
        current: string[],
        value: string,
        setFn: (v: string[]) => void,
    ) => {
        setFn(
            current.includes(value)
                ? current.filter((x) => x !== value)
                : [...current, value],
        );
    };

    // ── Location Detection ─────────────────────────────────────────────────
    const handleDetectLocation = () => {
        if (Platform.OS !== 'web') {
            showAlert('Location detection is only available on web.');
            return;
        }
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            showAlert('Geolocation is not supported by your browser.');
            return;
        }
        setIsDetecting(true);
        setLocationDetected(false);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                        { headers: { 'Accept-Language': 'en' } },
                    );
                    const data: any = await res.json();
                    const postcode: string | undefined = data?.address?.postcode;
                    if (postcode) {
                        const code = postcode.replace(/\s/g, '').slice(0, 10);
                        setZip(code.slice(0, 5));
                        setDetectedZipLabel(code.slice(0, 10));
                        setLocationDetected(true);
                    } else {
                        showAlert('Could not detect a zip code for your location.');
                    }
                } catch {
                    showAlert('Failed to retrieve location data.');
                } finally {
                    setIsDetecting(false);
                }
            },
            (err) => {
                showAlert('Location access denied: ' + err.message);
                setIsDetecting(false);
            },
            { timeout: 10000 },
        );
    };

    // ── Validation & Navigation ────────────────────────────────────────────
    const goNext = () => {
        if (step === 0) {
            if (!name.trim()) { showAlert('Please enter your first name.'); return; }
        }
        if (step === 1) {
            const ageNum = parseInt(age, 10);
            const ftNum = parseInt(heightFt, 10);
            const inNum = parseInt(heightIn || '0', 10);
            if (!ageNum || ageNum < 16 || ageNum > 80) { showAlert('Enter a valid age (16–80).'); return; }
            if (!ftNum || ftNum < 4 || ftNum > 7) { showAlert('Enter a valid height in feet.'); return; }
            if (inNum < 0 || inNum > 11) { showAlert('Inches must be between 0 and 11.'); return; }
        }
        if (step === 2) {
            const cw = parseFloat(currentWeightLbs);
            const tw = parseFloat(targetWeightLbs);
            if (!cw || !tw || cw <= 0 || tw <= 0) { showAlert('Enter valid current and target weight.'); return; }
        }
        if (step === 3) {
            if (!zip || zip.trim().length < 4) { showAlert('Enter a valid ZIP code.'); return; }
        }
        if (step === 4) {
            const budget = parseFloat(weeklyBudget.replace(/[^0-9.]/g, ''));
            if (!budget || budget < 10) { showAlert('Enter a weekly food budget of at least $10.'); return; }
        }
        if (step === 5) {
            void handleCalculateAndSave();
            return;
        }
        setStep((s) => s + 1);
    };

    // ── Save ───────────────────────────────────────────────────────────────
    const handleCalculateAndSave = async () => {
        const ageNum = parseInt(age, 10);
        const ftNum = parseInt(heightFt, 10);
        const inNum = parseInt(heightIn || '0', 10);
        const cwLbs = parseFloat(currentWeightLbs);
        const twLbs = parseFloat(targetWeightLbs);
        const budget = parseFloat(weeklyBudget.replace(/[^0-9.]/g, ''));

        if (!ageNum || !ftNum || isNaN(inNum) || !cwLbs || !twLbs || !budget) {
            showAlert('Please fill out all required fields.');
            return;
        }

        const heightCm = (ftNum * 12 + inNum) * 2.54;
        const cwKg = cwLbs * 0.453592;
        const twKg = twLbs * 0.453592;

        setIsSaving(true);
        setStep(6);

        try {
            const bmr = 10 * cwKg + 6.25 * heightCm - 5 * ageNum + 5;
            const actMul = ACTIVITY_MULTIPLIER[activityLevel] ?? 1.55;
            const tdee = bmr * actMul;
            let calorieGoal = tdee;
            if (twKg < cwKg) calorieGoal -= 500;
            else if (twKg > cwKg) calorieGoal += 500;
            calorieGoal = Math.round(Math.max(calorieGoal, 1200));

            let id = initialProfile?.id;
            let success = false;

            if (isEditing && id) {
                success = await updateProfile(id, name || 'User', calorieGoal, budget, cwKg, twKg, actMul);
            } else {
                const newId = await createProfile(name || 'User', calorieGoal, budget, cwKg, twKg, actMul);
                if (newId) { id = newId; success = true; }
            }

            if (success && id) {
                await AsyncStorage.setItem('soleri_user_id', id);
                await AsyncStorage.setItem(
                    'soleri_user_metadata',
                    JSON.stringify({
                        name,
                        age: ageNum,
                        heightFt: ftNum,
                        heightIn: inNum,
                        currentWeightLbs,
                        targetWeightLbs,
                        zip,
                        weeklyBudget: budget,
                        activity: activityLevel,
                        diet: dietTags,
                        cuisine: cuisineTags,
                    }),
                );
                onComplete({
                    id,
                    name: name || 'User',
                    daily_calorie_goal: calorieGoal,
                    weekly_dining_budget: budget,
                    current_weight: cwKg,
                    target_weight: twKg,
                    activity_level: actMul,
                    gender: 'male',
                    age: ageNum,
                    height: heightCm,
                } as IProfile);
                return;
            }
            showAlert('Unable to save your profile. Please try again.');
        } catch (error: any) {
            console.error(error);
            showAlert('Error saving profile: ' + (error?.message || String(error)));
        } finally {
            setIsSaving(false);
        }
    };

    // ── Progress Bar ───────────────────────────────────────────────────────
    const renderProgress = () => {
        const total = 6;
        return (
            <View style={s.progressRow}>
                {Array.from({ length: total }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            s.progressSeg,
                            i < step && s.progressDone,
                            i === step && s.progressCurrent,
                        ]}
                    />
                ))}
            </View>
        );
    };

    // ── Steps ──────────────────────────────────────────────────────────────
    const renderStep = () => {

        // ── Step 0: Name
        if (step === 0) {
            return (
                <>
                    <Text style={s.emoji}>👋</Text>
                    <Text style={s.title}>Hey, I'm Soleri.</Text>
                    <Text style={s.subtitle}>
                        I'll plan your week so you don't have to think about food every day.
                    </Text>
                    <Text style={s.label}>YOUR FIRST NAME</Text>
                    <TextInput
                        style={s.input}
                        placeholder="e.g. Alex"
                        placeholderTextColor={C.muted}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </>
            );
        }

        // ── Step 1: About you
        if (step === 1) {
            return (
                <>
                    <Text style={s.emoji}>📏</Text>
                    <Text style={s.title}>About you</Text>
                    <Text style={s.subtitle}>
                        This helps me calculate your daily calorie target accurately.
                    </Text>

                    <Text style={s.label}>AGE</Text>
                    <Stepper
                        value={age}
                        onChange={setAge}
                        min={16}
                        max={80}
                        step={1}
                        defaultVal={25}
                        placeholder="25"
                    />

                    <Text style={[s.label, { marginTop: 22 }]}>HEIGHT</Text>
                    <View style={s.heightRow}>
                        <Stepper
                            value={heightFt}
                            onChange={setHeightFt}
                            min={4}
                            max={7}
                            step={1}
                            defaultVal={5}
                            placeholder="5"
                            flex={1}
                        />
                        <View style={s.heightGap} />
                        <Stepper
                            value={heightIn}
                            onChange={setHeightIn}
                            min={0}
                            max={11}
                            step={1}
                            defaultVal={4}
                            placeholder="4"
                            flex={1}
                        />
                        <Text style={s.unitLabel}>feet &{'\n'}inches</Text>
                    </View>
                </>
            );
        }

        // ── Step 2: Weight goal
        if (step === 2) {
            return (
                <>
                    <Text style={s.emoji}>🎯</Text>
                    <Text style={s.title}>Weight goal</Text>
                    <Text style={s.subtitle}>
                        I'll build every meal plan around your daily calorie target.
                    </Text>

                    <Text style={s.label}>CURRENT WEIGHT (LBS)</Text>
                    <Stepper
                        value={currentWeightLbs}
                        onChange={setCurrentWeightLbs}
                        min={80}
                        max={500}
                        step={1}
                        defaultVal={150}
                        placeholder="150"
                    />

                    <Text style={[s.label, { marginTop: 22 }]}>TARGET WEIGHT (LBS)</Text>
                    <Stepper
                        value={targetWeightLbs}
                        onChange={setTargetWeightLbs}
                        min={80}
                        max={500}
                        step={1}
                        defaultVal={150}
                        placeholder="150"
                    />
                </>
            );
        }

        // ── Step 3: Location
        if (step === 3) {
            return (
                <>
                    <Text style={s.emoji}>📍</Text>
                    <Text style={s.title}>Where are you based?</Text>
                    <Text style={s.subtitle}>
                        I'll find nearby restaurants that fit your goals. Use location or enter your zip.
                    </Text>

                    <TouchableOpacity
                        style={[s.detectBtn, locationDetected && s.detectBtnDone]}
                        onPress={handleDetectLocation}
                        disabled={isDetecting}
                        activeOpacity={0.8}
                    >
                        {isDetecting ? (
                            <ActivityIndicator
                                color={locationDetected ? '#000' : C.lime}
                                size="small"
                            />
                        ) : (
                            <Text
                                style={[
                                    s.detectBtnText,
                                    locationDetected && s.detectBtnTextDone,
                                ]}
                            >
                                {locationDetected
                                    ? '✅ Location detected'
                                    : '📍 Detect my location'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {locationDetected && (
                        <Text style={s.detectedInfo}>
                            ✅ Location detected — zip {detectedZipLabel}
                        </Text>
                    )}

                    <Text style={[s.label, { marginTop: 18 }]}>OR ENTER ZIP CODE</Text>
                    <TextInput
                        style={s.input}
                        placeholder="e.g. 10001"
                        placeholderTextColor={C.muted}
                        value={zip}
                        onChangeText={setZip}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </>
            );
        }

        // ── Step 4: Budget & Activity
        if (step === 4) {
            return (
                <>
                    <Text style={s.emoji}>💰</Text>
                    <Text style={s.title}>Budget & activity</Text>
                    <Text style={s.subtitle}>
                        These shape how your plan balances eating out, groceries, and calories.
                    </Text>

                    <Text style={s.label}>WEEKLY FOOD BUDGET ($)</Text>
                    <Stepper
                        value={weeklyBudget}
                        onChange={setWeeklyBudget}
                        min={10}
                        max={9999}
                        step={10}
                        defaultVal={150}
                        placeholder="150"
                    />

                    <Text style={[s.label, { marginTop: 22 }]}>ACTIVITY LEVEL</Text>
                    <View style={s.chipGrid}>
                        {ACTIVITY_OPTIONS.map((opt) => {
                            const active = activityLevel === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[s.chip, active && s.chipActive]}
                                    onPress={() => setActivityLevel(opt.key as ActivityKey)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[s.chipText, active && s.chipTextActive]}>
                                        {opt.emoji} {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            );
        }

        // ── Step 5: Food preferences
        if (step === 5) {
            const dietOptions = [
                'Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto',
            ];
            const cuisineOptions = [
                'American 🇺🇸', 'Mexican 🌮', 'Mediterranean 🥙', 'Asian 🍜',
                'Italian 🍝', 'Indian 🍛', 'Japanese 🍣', 'Middle Eastern 🧆',
            ];

            return (
                <>
                    <Text style={s.emoji}>🍽️</Text>
                    <Text style={s.title}>Food preferences</Text>
                    <Text style={s.subtitle}>
                        Select any dietary needs and cuisines you enjoy most.
                    </Text>

                    <Text style={s.label}>DIETARY RESTRICTIONS</Text>
                    <View style={s.chipGrid}>
                        {dietOptions.map((d) => {
                            const active = dietTags.includes(d);
                            return (
                                <TouchableOpacity
                                    key={d}
                                    style={[s.chip, active && s.chipToggle]}
                                    onPress={() => toggleTag(dietTags, d, setDietTags)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[s.chipText, active && s.chipTextActive]}>
                                        {d}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={[s.label, { marginTop: 18 }]}>CUISINE PREFERENCES</Text>
                    <View style={s.chipGrid}>
                        {cuisineOptions.map((c) => {
                            const active = cuisineTags.includes(c);
                            return (
                                <TouchableOpacity
                                    key={c}
                                    style={[s.chip, active && s.chipToggle]}
                                    onPress={() => toggleTag(cuisineTags, c, setCuisineTags)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[s.chipText, active && s.chipTextActive]}>
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            );
        }

        // ── Generating
        return (
            <View style={s.generatingBox}>
                <Text style={s.emoji}>🤖</Text>
                <Text style={s.title}>Building your plan…</Text>
                <Text style={s.subtitle}>
                    Analyzing your goals, budget and preferences.
                </Text>
                <ActivityIndicator color={C.lime} size="large" style={{ marginTop: 28 }} />
            </View>
        );
    };

    const ctaLabel =
        isSaving ? 'Saving…' :
        step === 5 ? 'Generate My Plan 🚀' :
        'Continue →';

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {renderProgress()}

                    <View style={s.content}>
                        {renderStep()}
                    </View>

                    {step <= 5 && (
                        <View style={s.footer}>
                            <TouchableOpacity
                                style={[s.cta, isSaving && s.ctaDisabled]}
                                onPress={goNext}
                                disabled={isSaving}
                                activeOpacity={0.85}
                            >
                                <Text style={s.ctaText}>{ctaLabel}</Text>
                            </TouchableOpacity>

                            {isEditing && onCancel && (
                                <TouchableOpacity
                                    style={s.cancelBtn}
                                    onPress={onCancel}
                                    disabled={isSaving}
                                >
                                    <Text style={s.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scroll: {
        flexGrow: 1,
        paddingBottom: 48,
    },

    // ── Progress
    progressRow: {
        flexDirection: 'row',
        gap: 5,
        paddingHorizontal: 22,
        paddingTop: 18,
        marginBottom: 6,
    },
    progressSeg: {
        flex: 1,
        height: 3,
        borderRadius: 999,
        backgroundColor: '#252530',
    },
    progressDone: {
        backgroundColor: C.lime,
    },
    progressCurrent: {
        backgroundColor: C.lime,
        opacity: 0.45,
    },

    // ── Content
    content: {
        paddingHorizontal: 24,
        paddingTop: 22,
    },
    emoji: {
        fontSize: 46,
        marginBottom: 14,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: C.text,
        marginBottom: 8,
        lineHeight: 36,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: C.muted,
        lineHeight: 22,
        marginBottom: 30,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: C.muted,
        letterSpacing: 1.3,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: C.surface,
        color: C.text,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 17,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 4,
    },

    // ── Stepper
    stepperWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
        height: 56,
    },
    stepBtn: {
        width: 52,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.surfaceUp,
    },
    stepBtnText: {
        fontSize: 26,
        color: C.text,
        fontWeight: '300',
        lineHeight: 30,
        includeFontPadding: false,
    },
    stepInput: {
        flex: 1,
        color: C.text,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: 0,
    },

    // ── Height row
    heightRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heightGap: {
        width: 10,
    },
    unitLabel: {
        fontSize: 13,
        color: C.muted,
        fontWeight: '600',
        lineHeight: 18,
        marginLeft: 12,
    },

    // ── Location
    detectBtn: {
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.lime,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        minHeight: 54,
    },
    detectBtnDone: {
        backgroundColor: C.lime,
        borderColor: C.lime,
    },
    detectBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: C.lime,
    },
    detectBtnTextDone: {
        color: C.bg,   // dark text on lime background
    },
    detectedInfo: {
        fontSize: 13,
        color: C.lime,
        fontWeight: '600',
        marginBottom: 4,
    },

    // ── Activity Chips
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.surface,
    },
    chipActive: {
        backgroundColor: C.lime,
        borderColor: C.lime,
    },
    chipToggle: {
        backgroundColor: '#1C1C2A',
        borderColor: C.lime,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: C.text,
    },
    chipTextActive: {
        color: C.bg,   // dark text on lime background
    },

    // ── Footer / CTA
    footer: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    cta: {
        backgroundColor: C.lime,
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
    },
    ctaDisabled: {
        opacity: 0.55,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: '800',
        color: C.bg,   // dark text on lime background
        letterSpacing: 0.2,
    },
    cancelBtn: {
        marginTop: 14,
        alignItems: 'center',
        paddingVertical: 10,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: C.muted,
    },

    // ── Generating
    generatingBox: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 16,
    },
});
