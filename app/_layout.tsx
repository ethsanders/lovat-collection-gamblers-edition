import { Slot, SplashScreen, Stack } from "expo-router";
import { NativeModules, View } from "react-native";
import { colors } from "../lib/colors";

import {
    useFonts,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
} from "@expo-google-fonts/heebo";

import { useCallback, useEffect, useState } from "react";
import { ServiceValues, ServicesContext, services } from "../lib/services";
import { DataSource } from "../lib/localCache";

import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json'
import AsyncStorage from "@react-native-async-storage/async-storage";

const {UIManager} = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);

TimeAgo.addDefaultLocale(en);

SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [fontsLoaded, fontError] = useFonts({
        Heebo_400Regular,
        Heebo_500Medium,
        Heebo_600SemiBold,
        Heebo_700Bold,
        MaterialSymbols_500Rounded: require("../assets/fonts/Material-Symbols-Rounded.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    const [serviceValues, setServiceValues] = useState<ServiceValues>({
        teamScouters: null,
        tournaments: null,
    });

    const loadServices = () => Promise.allSettled(services.map(async service => {
        const value = await service.get();

        setServiceValues((values) => ({
            ...values,
            [service.id]: value,
        }));
    }));

    useEffect(() => {
        loadServices();

        const interval = setInterval(loadServices, 60 * 2 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ServicesContext.Provider value={serviceValues}>
            <View style={{ backgroundColor: colors.background.default, flex: 1 }} onLayout={onLayoutRootView}>
                <Slot />
            </View>
        </ServicesContext.Provider>
    );
}
