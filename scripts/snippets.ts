// Generates the "derived artifact" outputs shown on the homepage from the REAL library, so the site
// never displays a hand-written schema that could drift from what adorn actually emits.
//
//   npm run snippets   (runs ../adorn's ts-node against ../adorn/dist; writes
//   public/assets/snippets.json)
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
    Contract, Describe, NotEmpty, OneOf, GreaterThanEqual, LessThanEqual,
    setContractDiagnosticsEnabled,
} from '../../adorn/dist/index';
import {toolSchemaForMethod, documentClass, renderMarkdown} from '../../adorn/dist/schema';
import {telemetryForClass, serializeTelemetry} from '../../adorn/dist/privacy';

setContractDiagnosticsEnabled(false);

// The canonical homepage example: a plain contracted method, no @Tool. The tool description is given at
// the projection call site, as the homepage shows it.
@Contract()
class WeatherService {
    getWeather(
        @Describe('the city to look up') @NotEmpty() location: string,
        @OneOf(['celsius', 'fahrenheit']) unit: string,
        @GreaterThanEqual(1) @LessThanEqual(7) days: number,
    ): string {
        return `${days}-day forecast for ${location} in ${unit}`;
    }
}

let violation = '';
try {
    new WeatherService().getWeather('Lisbon', 'celsius', 99);
} catch (e) {
    violation = (e as Error).message;
}

const out = {
    toolSchema: JSON.stringify(
        toolSchemaForMethod(WeatherService, 'getWeather', {description: 'Look up a weather forecast.'}),
        null,
        2,
    ),
    violation,
    markdown: renderMarkdown([documentClass(WeatherService)]),
    telemetry: serializeTelemetry(telemetryForClass(WeatherService)),
};
writeFileSync(resolve(__dirname, '../public/assets/snippets.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
