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
    Date as FakerDate, // Type collision avoidance if needed
    Faker
} from '@faker-js/faker';

export interface Identity {
    firstName: string;
    lastName: string;
    location: string;
    country: string;
}

export type SupportedCountry = 'USA' | 'UK' | 'Japan' | 'France' | 'Germany' | 'Italy' | 'Spain' | 'Russia' | 'China';

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

    public static generateIdentity(country: SupportedCountry = 'USA'): Identity {
        const fakerInstance = LOCALE_MAP[country] || fakerEN_US;

        const sex = fakerInstance.person.sexType();
        const firstName = fakerInstance.person.firstName(sex);
        const lastName = fakerInstance.person.lastName();
        const city = fakerInstance.location.city();
        const state = fakerInstance.location.state(); // Note: Not all locales have states, might be undefined/generic

        // Format location based on locale nuances if we wanted to be very specific, 
        // but typically "City, Country" or "City, State" is fine.
        // For international consistency, we'll try "City, Region" if available, or just City.

        let locationString = city;
        if (country === 'USA' || country === 'UK' || country === 'Germany') {
            // Countries where state/county is commonly cited
            locationString = `${city}, ${state}`;
        } else {
            locationString = `${city}, ${country}`;
        }

        return {
            firstName,
            lastName,
            location: locationString,
            country
        };
    }

    public static getSupportedCountries(): SupportedCountry[] {
        return COUNTRY_OPTIONS;
    }
}
