import { fleetAuthAPIHeaders } from "../common";
import { fleetV1 } from "./apiBase";

const fleetFetcher = async (url: string) => {
  const response = await fleetV1(url, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });
  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.error.message || 'An error occurred while fetching the data'
    );
  }

  return json;
};

export default fleetFetcher;
