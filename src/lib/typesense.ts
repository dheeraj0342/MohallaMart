// Typesense configuration and utilities
import { Client as TypesenseClient } from "typesense";

export interface TypesenseConfig {
  nodes: Array<{
    host: string;
    port: number;
    protocol: string;
  }>;
  apiKey: string;
  connectionTimeoutSeconds: number;
}

export interface SearchResult {
  hits: Array<{
    document: Record<string, unknown>;
    highlights: unknown[];
    text_match: number;
  }>;
  found: number;
  page: number;
  search_time_ms: number;
}

export interface SearchParams {
  q: string;
  query_by: string;
  filter_by?: string;
  sort_by?: string;
  per_page?: number;
  page?: number;
  highlight_full_fields?: string;
  snippet_threshold?: number;
  num_typos?: number;
}

class TypesenseService {
  private client: TypesenseClient;
  private config: TypesenseConfig;

  constructor() {
    this.config = {
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || "localhost",
          port: parseInt(process.env.TYPESENSE_PORT || "8108"),
          protocol: "http",
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || "",
      connectionTimeoutSeconds: 2,
    };

    if (!this.config.apiKey) {
      console.warn(
        "Typesense API key is not set. Please set TYPESENSE_API_KEY environment variable.",
      );
    }

    this.client = new TypesenseClient(this.config);
  }

  // Search products
  async searchProducts(params: SearchParams): Promise<SearchResult> {
    try {
      const searchParams = {
        q: params.q,
        query_by: params.query_by,
        filter_by: params.filter_by,
        sort_by: params.sort_by,
        per_page: params.per_page || 20,
        page: params.page || 1,
        highlight_full_fields:
          params.highlight_full_fields || "name,description",
        snippet_threshold: params.snippet_threshold || 30,
        num_typos: params.num_typos || 2,
      };

      const result = await this.client
        .collections("products")
        .documents()
        .search(searchParams);
      return result as SearchResult;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  // Search shops
  async searchShops(params: SearchParams): Promise<SearchResult> {
    try {
      const searchParams = {
        q: params.q,
        query_by: params.query_by,
        filter_by: params.filter_by,
        sort_by: params.sort_by,
        per_page: params.per_page || 20,
        page: params.page || 1,
        highlight_full_fields:
          params.highlight_full_fields || "name,description",
        snippet_threshold: params.snippet_threshold || 30,
        num_typos: params.num_typos || 2,
      };

      const result = await this.client
        .collections("shops")
        .documents()
        .search(searchParams);
      return result as SearchResult;
    } catch (error) {
      console.error("Error searching shops:", error);
      throw error;
    }
  }

  // Index a product
  async indexProduct(product: Record<string, unknown>): Promise<unknown> {
    try {
      return await this.client
        .collections("products")
        .documents()
        .create(product);
    } catch (error) {
      console.error("Error indexing product:", error);
      throw error;
    }
  }

  // Index a shop
  async indexShop(shop: Record<string, unknown>): Promise<unknown> {
    try {
      return await this.client.collections("shops").documents().create(shop);
    } catch (error) {
      console.error("Error indexing shop:", error);
      throw error;
    }
  }

  // Update a product
  async updateProduct(
    id: string,
    product: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      return await this.client
        .collections("products")
        .documents(id)
        .update(product);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  // Update a shop
  async updateShop(
    id: string,
    shop: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      return await this.client.collections("shops").documents(id).update(shop);
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(id: string): Promise<unknown> {
    try {
      return await this.client.collections("products").documents(id).delete();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // Delete a shop
  async deleteShop(id: string): Promise<unknown> {
    try {
      return await this.client.collections("shops").documents(id).delete();
    } catch (error) {
      console.error("Error deleting shop:", error);
      throw error;
    }
  }

  // Get search suggestions
  async getSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<string[]> {
    try {
      const searchParams = {
        q: query,
        query_by: "name,description",
        per_page: limit,
        page: 1,
        highlight_full_fields: "name",
        snippet_threshold: 20,
        num_typos: 1,
      };

      const results = (await this.client
        .collections("products")
        .documents()
        .search(searchParams)) as SearchResult;

      return results.hits.map((hit) => hit.document.name as string);
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  }

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      // This would typically be implemented with analytics data
      // For now, return some sample popular searches
      return [
        "milk",
        "bread",
        "eggs",
        "rice",
        "vegetables",
        "fruits",
        "snacks",
        "beverages",
        "dairy",
        "groceries",
      ].slice(0, limit);
    } catch (error) {
      console.error("Error getting popular searches:", error);
      return [];
    }
  }

  // Get client configuration
  getClientConfig() {
    return {
      nodes: this.config.nodes,
      apiKey: this.config.apiKey,
      connectionTimeoutSeconds: this.config.connectionTimeoutSeconds,
    };
  }
}

// Export singleton instance
export const typesenseService = new TypesenseService();

// Types are already exported as interfaces above
