
import { fakerEN_US, fakerEN_GB, fakerJA, fakerFR, fakerDE, fakerIT, fakerES, fakerRU, fakerZH_CN } from '@faker-js/faker';

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
            // Check if we can access the definitions to get a full list?
            // In v8, definitions might be accessible via `faker.definitions` if we import `base`? 
            // Or just check if `state()` returns something valid.
            const sample = fakerInstance.location.state();
            console.log(`Sample state: ${sample}`);

            // Try to find if there is a way to get the list
            // @ts-ignore
            if (fakerInstance.definitions?.location?.state) {
                // @ts-ignore
                console.log(`Found definitions: ${fakerInstance.definitions.location.state.length} states`);
            } else {
                console.log("No direct definitions access found on instance.");
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

checkStates();
