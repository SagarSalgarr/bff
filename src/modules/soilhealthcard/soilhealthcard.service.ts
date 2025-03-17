import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface SoilHealthResponse {
  data: {
    getTestForAuthUser: Array<{
      id: string;
      farmer: {
        name: string;
        phone: string;
        address: string;
      };
      plot: {
        address: string;
        area: string;
        surveyNo: string;
      };
      results: {
        n: string;
        p: string;
        k: string;
        B: string;
        Fe: string;
        Zn: string;
        Cu: string;
        S: string;
        OC: string;
        pH: string;
        EC: string;
        Mn: string;
      };
      crop: string;
      status: string;
      html: string;
      uniqueID: string;
    }>;
  };
}

@Injectable()
export class SoilhealthcardService {
  private readonly logger = new Logger(SoilhealthcardService.name);
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async generateAccessToken(): Promise<string> {
    this.accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJBY2Nlc3NUb2tlbiIsImF1dGhvcml0eSI6IiIsInBhcmVudCI6IiIsInR5cGUiOiJFeHRlcm5hbFVzZXIiLCJ1c2VyIjoiNjc3NzgwZWYzNzkyZjZmOWQxMzExOWJkIiwidXNlcnN0YXR1cyI6IkFDVElWRSIsImlhdCI6MTc0MTY3MzExNiwiZXhwIjoxNzQyMjc3OTE2LCJhdWQiOiJzb2lsaGVhbHRoLmRhYy5nb3YuaW4iLCJpc3MiOiJzb2lsaGVhbHRoLmRhYy5nb3YuaW4iLCJqdGkiOiIyMTE0ZGQ5Yi01MTA1LTQ3YWItYjg3Mi1kZDdiOGJiNmNjMDcifQ.NSTiedI48rKoIz8Of0IK6yrDYWopGV74l4eMsGun-ZQ";
    try {
      if (this.accessToken) {
        return this.accessToken;
      }

      const refreshToken = this.refreshToken || this.configService.get('SOIL_HEALTH_TOKEN');
      console.log('Using refresh token:', refreshToken);

      const response = await firstValueFrom(
        this.httpService.post(
          this.configService.get('SOIL_HEALTH_BASE_URL'),
          {
            query: `query Query($refreshToken: String!) {
              generateAccessToken(refreshToken: $refreshToken) {
                token
                refreshToken
              }
            }`,
            variables: { refreshToken }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )
      );

      console.log('Response from gen token:', response)

      if (!response.data?.data?.generateAccessToken?.token) {
        throw new Error('Failed to generate access token');
      }

      this.accessToken = response.data.data.generateAccessToken.token;
      this.refreshToken = response.data.data.generateAccessToken.refreshToken;

      return this.accessToken;

    } catch (error) {
      this.logger.error('Error generating access token:', error.message);
      this.accessToken = null;
      this.refreshToken = null;
      throw new Error('Failed to generate access token');
    }
  }


  async getSoilHealthCard(phoneNumber: string): Promise<any> {
    try {
      // Get fresh access token
      const token = await this.generateAccessToken();
      
      // Format phone number to include country code if not present
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const response = await firstValueFrom(
        this.httpService.post<SoilHealthResponse>(
          this.configService.get('SOIL_HEALTH_BASE_URL'),
          {
            query: `query GetTestForAuthUser($computedId: String, $phone: PhoneNumber, $state: String, $district: String, $name: String, $farmer: String, $from: Datetime, $to: Datetime, $cycle: String, $locale: String, $scheme: String, $limit: Int, $skip: Int) {
              getTestForAuthUser(computedID: $computedId, phone: $phone, state: $state, district: $district, name: $name, farmer: $farmer, from: $from, to: $to, cycle: $cycle, scheme: $scheme, limit: $limit, skip: $skip) {
                id
                computedID
                cycle
                scheme
                plot {
                  address
                  area
                  surveyNo
                }
                farmer {
                  address
                  name
                  phone
                }
                crop
                location
                testparameters
                rdfValues
                status
                testCompletedAt
                sampleDate
                reportData
                district
                block
                village
                results
                fertilizer
                html(locale: $locale)
                uniqueID
              }
            }`,
            variables: {
              state: this.configService.get('SOIL_HEALTH_STATE'),
              district: this.configService.get('SOIL_HEALTH_DISTRICT'),
              cycle: this.configService.get('SOIL_HEALTH_CYCLE'),
              scheme: this.configService.get('SOIL_HEALTH_SCHEME'),
              phone: formattedPhone,
              limit: 10,
              skip: 0
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        )
      );

      if (!response.data?.data?.getTestForAuthUser?.length) {
        throw new Error('No soil health card found for this mobile number');
      }

      const soilHealthData = response.data.data.getTestForAuthUser[0];
      return this.formatSoilHealthResponse(soilHealthData);

    } catch (error) {
      // If we get an auth error, clear the tokens and retry once
      if (error.response?.status === 401) {
        this.accessToken = null;
        this.refreshToken = null;
        return this.getSoilHealthCard(phoneNumber); // Retry once
      }
      this.logger.error('Error fetching soil health card:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch soil health card');
    }
  }

  private formatSoilHealthResponse(data: any): any {
    try {
      const farmerName = data.farmer?.name || 'Farmer';
      const farmerAddress = data.farmer?.address || 'N/A';
      const plotDetails = data.plot || {};
      const results = data.results || {};
      const htmlContent = data.html || '';

      // Create a structured response
      return {
        type: 'soil_health_card',
        content: {
          farmerDetails: {
            name: farmerName,
            address: farmerAddress,
            phone: data.farmer?.phone
          },
          plotDetails: {
            address: plotDetails.address,
            area: plotDetails.area,
            surveyNo: plotDetails.surveyNo
          },
          soilTestResults: {
            nitrogen: results.n,
            phosphorus: results.p,
            potassium: results.k,
            boron: results.B,
            iron: results.Fe,
            zinc: results.Zn,
            copper: results.Cu,
            sulphur: results.S,
            organicCarbon: results.OC,
            pH: results.pH,
            electricalConductivity: results.EC,
            manganese: results.Mn
          },
          crop: data.crop,
          status: data.status,
          uniqueID: data.uniqueID,
          html: this.sanitizeHtml(htmlContent)
        },
        message: `Dear ${farmerName}, here is your Soil Health Card report.`
      };

    } catch (error) {
      this.logger.error('Error formatting soil health response:', error);
      throw new Error('Failed to format soil health card response');
    }
  }

  private sanitizeHtml(html: string): string {
    // Remove potentially harmful scripts
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove inline styles and events
    html = html.replace(/ style="[^"]*"/g, '');
    html = html.replace(/ on\w+="[^"]*"/g, '');
    
    // Add target="_blank" to all links
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    
    return html;
  }

  async validatePhoneNumber(phone: string): Promise<boolean> {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit Indian mobile number
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return false;
    }
    
    return true;
  }
}