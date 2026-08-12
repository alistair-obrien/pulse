using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Pulse.Api.Models;
using Pulse.Api.Options;
using Pulse.Infrastructure;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Pulse.Api.Services
{
    public class PulseAuthenticationService
    {
        private readonly JwtOptions _jwtOptions;
        private readonly GoogleOptions _googleOptions;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly PulseDbContext _db;
        private readonly HttpClient _httpClient;

        public PulseAuthenticationService(
            IOptions<JwtOptions> jwtOptions,
            IOptions<GoogleOptions> googleOptions,
            UserManager<ApplicationUser> userManager, 
            PulseDbContext db,
            IHttpClientFactory httpClientFactory)
        {
            _jwtOptions = jwtOptions.Value;
            _googleOptions = googleOptions.Value;
            _userManager = userManager;
            _db = db;
            _httpClient = httpClientFactory.CreateClient();
        }

        private async Task<LoginResponse> CreateSession(ApplicationUser user)
        {
            var accessToken = GenerateAccessToken(user.Id, user.Email!);

            var refreshToken = GenerateRefreshToken();

            _db.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryInDays)
            });

            await _db.SaveChangesAsync();

            return new LoginResponse(
                accessToken,
                refreshToken,
                _jwtOptions.ExpiryInSeconds,
                user.Id);
        }

        public async Task<LoginResponse> LoginWithGoogle(GoogleLoginRequest request)
        {
            var idToken = await ResolveGoogleIdToken(request);

            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[]
                    {
                    _googleOptions.ClientId
                    }
                });

            if (!payload.EmailVerified)
            {
                throw new UnauthorizedAccessException("Email not verified.");
            }
            var user = await FindOrCreateUser(payload.Email, payload.Email, payload.EmailVerified, payload.Picture);

            return await CreateSession(user);
        }

        public async Task<LoginResponse> Refresh(string refreshToken)
        {
            var stored = await _db.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(r => r.Token == refreshToken);

            if (stored == null)
                throw new UnauthorizedAccessException();

            if (stored.RevokedAtUtc != null)
                throw new UnauthorizedAccessException();

            if (stored.ExpiresAtUtc < DateTime.UtcNow)
                throw new UnauthorizedAccessException();

            _db.RefreshTokens.Remove(stored);

            await _db.SaveChangesAsync();

            return await CreateSession(stored.User!);
        }

        public async Task Logout(string refreshToken)
        {
            var stored = await _db.RefreshTokens
                .SingleOrDefaultAsync(r => r.Token == refreshToken);

            if (stored == null)
                return;

            _db.RefreshTokens.Remove(stored);

            await _db.SaveChangesAsync();
        }

        private async Task<ApplicationUser> FindOrCreateUser(
            string email,
            string username,
            bool emailVerified,
            string? picture)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user != null)
            {
                if (user.ProfileImage == null && picture != null) 
                { 
                    user.ProfileImage = picture; 
                    await _userManager.UpdateAsync(user);
                }
                return user;
            }

            user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                EmailConfirmed = emailVerified,
            };
            if (picture != null) { user.ProfileImage = picture; }

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            return user;
        }

        private string GenerateAccessToken(string userId, string email)
        {
            var secretKey = _jwtOptions.Key;
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Define claims mapping to user parameters
            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddSeconds(_jwtOptions.ExpiryInSeconds),
                Issuer = _jwtOptions.Issuer,
                Audience = _jwtOptions.Audience,
                SigningCredentials = credentials
            };

            var handler = new JsonWebTokenHandler();
            return handler.CreateToken(tokenDescriptor);
        }

        private static string GenerateRefreshToken()
        {
            return Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));
        }

        private async Task<string> ResolveGoogleIdToken(GoogleLoginRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.IdToken) &&
                !string.IsNullOrWhiteSpace(request.AuthorizationCode))
            {
                throw new BadHttpRequestException("Specify either IdToken or AuthorizationCode, not both.");
            }

            if (!string.IsNullOrWhiteSpace(request.IdToken))
                return request.IdToken;

            if (!string.IsNullOrWhiteSpace(request.AuthorizationCode))
                return await ExchangeGoogleCodeForIdToken(request.AuthorizationCode);

            throw new BadHttpRequestException("Either an IdToken or AuthorizationCode must be supplied.");
        }

        private async Task<string> ExchangeGoogleCodeForIdToken(string authorizationCode)
        {
            var response = await _httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = authorizationCode,
                    ["client_id"] = _googleOptions.ClientId,
                    ["client_secret"] = _googleOptions.ClientSecret,
                    ["redirect_uri"] = _googleOptions.RedirectUri,
                    ["grant_type"] = "authorization_code"
                }));

            var body = await response.Content.ReadAsStringAsync();

            Console.WriteLine(body);

            response.EnsureSuccessStatusCode();

            var token = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>();

            return token!.IdToken;
        }
    }
}