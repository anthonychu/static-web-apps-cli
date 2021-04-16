import { generateSwaApiFunctions } from "../../core/utils/swa-api";
import * as path from "path";

export async function generateApiOutput(context: string) {
  generateSwaApiFunctions(path.resolve(context, "api"), true);
}
