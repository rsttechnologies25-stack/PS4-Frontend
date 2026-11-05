export interface DeliveryZoneConfig {
    enabled: boolean;
    allowedAreas: string[];
    customPincodes: string[];
}

export const AREA_PINCODE_MAP: Record<string, { aliases: string[]; pincodes: string[] }> = {
    chennai: {
        aliases: ['chennai', 'madras', 'ch-'],
        pincodes: ['600*']
    },
    tiruvallur: {
        aliases: ['tiruvallur', 'thiruvallur', 'avadi', 'ambattur', 'ponneri', 'gummidipoondi', 'poochiyambakkam'],
        pincodes: ['601*', '602*']
    },
    kanchipuram: {
        aliases: ['kanchipuram', 'kancheepuram', 'kanchi'],
        pincodes: ['631*']
    },
    chengalpattu: {
        aliases: ['chengalpattu', 'chengalpet', 'tambaram', 'chromepet', 'pallavaram', 'vandalur'],
        pincodes: ['603*']
    },
    coimbatore: {
        aliases: ['coimbatore', 'kovai', 'pollachi'],
        pincodes: ['641*']
    },
    madurai: {
        aliases: ['madurai'],
        pincodes: ['625*']
    },
    trichy: {
        aliases: ['trichy', 'tiruchirappalli', 'tiruchirapalli'],
        pincodes: ['620*']
    },
    salem: {
        aliases: ['salem'],
        pincodes: ['636*']
    },
    tirunelveli: {
        aliases: ['tirunelveli', 'nellai'],
        pincodes: ['627*']
    },
    vellore: {
        aliases: ['vellore', 'katpadi'],
        pincodes: ['632*']
    },
    erode: {
        aliases: ['erode'],
        pincodes: ['638*']
    },
    thanjavur: {
        aliases: ['thanjavur', 'tanjore'],
        pincodes: ['613*']
    },
    dindigul: {
        aliases: ['dindigul'],
        pincodes: ['624*']
    },
    ranipet: {
        aliases: ['ranipet'],
        pincodes: ['632*']
    },
    tirupathur: {
        aliases: ['tirupathur', 'tirupattur'],
        pincodes: ['635*']
    },
    tiruppur: {
        aliases: ['tiruppur', 'tirupur'],
        pincodes: ['641*']
    }
};

export function isDeliveryLocationAllowed(
    address: {
        city?: string | null;
        pincode?: string | null;
        state?: string | null;
        addressLine1?: string | null;
    },
    config: DeliveryZoneConfig | null | undefined
): { allowed: boolean; matchedBy?: string; reason?: string } {
    if (!config || !config.enabled || !Array.isArray(config.allowedAreas) || config.allowedAreas.length === 0) {
        return { allowed: true };
    }

    const city = (address.city || '').trim().toLowerCase();
    const pincode = (address.pincode || '').trim().replace(/\s+/g, '');
    const state = (address.state || '').trim().toLowerCase();
    const addressLine1 = (address.addressLine1 || '').trim().toLowerCase();

    // If no address entered yet, allow typing without premature error
    if (!city && !pincode && !addressLine1) {
        return { allowed: true };
    }

    for (const rawArea of config.allowedAreas) {
        const areaLower = rawArea.trim().toLowerCase();
        if (!areaLower) continue;

        // 1. Direct city name match
        if (city && (city === areaLower || city.includes(areaLower) || areaLower.includes(city))) {
            return { allowed: true, matchedBy: rawArea };
        }

        // 2. Address Line 1 match
        if (addressLine1 && addressLine1.includes(areaLower)) {
            return { allowed: true, matchedBy: rawArea };
        }

        // 3. State match
        if (state && (state === areaLower || state.includes(areaLower))) {
            return { allowed: true, matchedBy: rawArea };
        }

        // 4. Known aliases & pincodes mapping
        const mapping = AREA_PINCODE_MAP[areaLower];
        if (mapping) {
            for (const alias of mapping.aliases) {
                if ((city && city.includes(alias)) || (addressLine1 && addressLine1.includes(alias))) {
                    return { allowed: true, matchedBy: rawArea };
                }
            }

            if (pincode) {
                for (const pinPattern of mapping.pincodes) {
                    if (pinPattern.endsWith('*')) {
                        const prefix = pinPattern.slice(0, -1);
                        if (pincode.startsWith(prefix)) {
                            return { allowed: true, matchedBy: `${rawArea} (PIN: ${pincode})` };
                        }
                    } else if (pincode === pinPattern) {
                        return { allowed: true, matchedBy: `${rawArea} (PIN: ${pincode})` };
                    }
                }
            }
        }
    }

    // 5. Custom pincodes check
    if (Array.isArray(config.customPincodes) && pincode) {
        for (const rawPin of config.customPincodes) {
            const pinPattern = rawPin.trim();
            if (!pinPattern) continue;

            if (pinPattern.endsWith('*')) {
                const prefix = pinPattern.slice(0, -1);
                if (pincode.startsWith(prefix)) {
                    return { allowed: true, matchedBy: `Pincode ${pinPattern}` };
                }
            } else if (pincode === pinPattern) {
                return { allowed: true, matchedBy: `Pincode ${pinPattern}` };
            }
        }
    }

    return {
        allowed: false,
        reason: `Orders are currently accepted only for delivery in: ${config.allowedAreas.join(', ')}.`
    };
}
