import {
    fakerEN_US,
    fakerEN_GB,
    fakerJA,
    fakerFR,
    fakerDE,
    fakerIT,
    fakerES,
    fakerRU,
    fakerZH_CN,
    Faker
} from '@faker-js/faker';

export interface Identity {
    firstName: string;
    lastName: string;
    location: string;
    country: string;
    gender: string;
    town: string;
    state: string;
}

export type SupportedCountry = 'USA' | 'UK' | 'Japan' | 'France' | 'Germany' | 'Italy' | 'Spain' | 'Russia' | 'China';
export type GenderOption = 'male' | 'female';

export const COUNTRY_OPTIONS: SupportedCountry[] = [
    'USA', 'UK', 'Japan', 'France', 'Germany', 'Italy', 'Spain', 'Russia', 'China'
];

const LOCALE_MAP: Record<SupportedCountry, Faker> = {
    'USA': fakerEN_US,
    'UK': fakerEN_GB,
    'Japan': fakerJA,
    'France': fakerFR,
    'Germany': fakerDE,
    'Italy': fakerIT,
    'Spain': fakerES,
    'Russia': fakerRU,
    'China': fakerZH_CN
};

export class NameGenerator {

    public static generateIdentity(country: SupportedCountry = 'USA', gender?: GenderOption, state?: string): Identity {
        const fakerInstance = LOCALE_MAP[country] || fakerEN_US;

        const sex = gender || fakerInstance.person.sexType();
        const firstName = fakerInstance.person.firstName(sex);
        const lastName = fakerInstance.person.lastName();
        const city = fakerInstance.location.city();
        const randomState = fakerInstance.location.state(); // Note: Not all locales have states, might be undefined/generic

        // Format location based on locale nuances if we wanted to be very specific, 
        // but typically "City, Country" or "City, State" is fine.
        // For international consistency, we'll try "City, Region" if available, or just City.

        let locationString = '';
        let finalStateInfo = '';
        if (country === 'USA' || country === 'UK' || country === 'Germany') {
            // Countries where state/county is commonly cited
            // If state is provided, use it. Otherwise random.
            // Note: Faker's state() returns a random state from the locale. 
            // If we have a specific state, we use it.
            finalStateInfo = state || randomState;
            locationString = `${city}, ${finalStateInfo}`;
        } else {
            if (state) {
                locationString = `${city}, ${state}`;
                finalStateInfo = state;
            } else {
                locationString = `${city}, ${country}`;
            }
        }

        return {
            firstName,
            lastName,
            location: locationString,
            country,
            gender: sex.charAt(0).toUpperCase() + sex.slice(1), // 'Male' or 'Female'
            town: city,
            state: finalStateInfo || randomState || ''
        };
    }

    public static getStates(country: SupportedCountry): string[] {
        const fakerInstance = LOCALE_MAP[country];
        // Accessing definitions safely. 
        // Note: The type definition for faker v8+ might not expose definitions directly on the localized instance interface 
        // identically to how the internal JS object structure is.
        // However, based on our test script, `fakerInstance.definitions.location.state` existed dynamically.
        // We might need to cast to 'any' to avoid TS errors if the types don't officially support it yet on the interface.

        // @ts-ignore
        const states = fakerInstance.definitions?.location?.state;

        if (Array.isArray(states)) {
            return states.sort();
        }
        return [];
    }

    public static getSupportedCountries(): SupportedCountry[] {
        return COUNTRY_OPTIONS;
    }
}
