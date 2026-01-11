
const { fakerEN_US, fakerEN_GB, fakerJA, fakerFR, fakerDE, fakerIT, fakerES, fakerRU, fakerZH_CN } = require('@faker-js/faker');

const locales = {
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

async function checkStates() {
    for (const [country, fakerInstance] of Object.entries(locales)) {
        console.log(`--- ${country} ---`);
        try {
            // Attempt to access definitions directly if available, or just generate a few
            // Note: In v8+, definitions are often under `faker.definitions` but might need specific access
            // In many versions of faker, definitions are not directly exposed on the instance publicly in a guaranteed way for all locales, 
            // but let's see if we can get them or if we have to rely on a hardcoded list/library.

            // For some locales, state might be 'county' or 'prefecture'
            console.log(`Sample state: ${fakerInstance.location.state()}`);
        } catch (e) {
            console.log(`Error getting state for ${country}: ${e.message}`);
        }
    }
}

checkStates();
