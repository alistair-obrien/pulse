using System.Text.Json;

namespace Pulse.Api.Integrations
{
    public abstract class ApiClient
    {
        protected readonly HttpClient Http;

        protected ApiClient(HttpClient http)
        {
            Http = http;
        }

        protected async Task<T> GetAsync<T>(string url)
        {
            var response = await Http.GetAsync(url);

            var body = await response.Content.ReadAsStringAsync();

            Console.WriteLine(body);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"GET {url}\nHTTP {(int)response.StatusCode} ({response.StatusCode})\n{body}");
            }

            return (await response.Content.ReadFromJsonAsync<T>())!;
        }
    }
}