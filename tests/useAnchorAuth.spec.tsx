import { renderHook, act } from "@testing-library/react";
import { useAnchorAuth } from "../hooks/useAnchorAuth";

jest.mock("../cache/anchorAuthCache", () => ({
  getAnchorAuthCache: jest.fn(),
  setAnchorAuthCache: jest.fn(),
}));

const mockGetCache = require("../cache/anchorAuthCache").getAnchorAuthCache;
const mockSetCache = require("../cache/anchorAuthCache").setAnchorAuthCache;

describe("useAnchorAuth", () => {
  const anchorId = "test-anchor";

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("loads JWT from cache", () => {
    mockGetCache.mockReturnValue("cached-jwt");

    const { result } = renderHook(() => useAnchorAuth(anchorId));

    expect(result.current.jwt).toBe("cached-jwt");
    expect(result.current.isAuthenticating).toBe(false);
  });

  it("authenticates successfully", async () => {
    mockGetCache.mockReturnValue(null);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ jwt: "new-jwt" }),
    });

    const { result } = renderHook(() => useAnchorAuth(anchorId));

    await act(async () => {
      await result.current.authenticate();
    });

    expect(result.current.jwt).toBe("new-jwt");
    expect(mockSetCache).toHaveBeenCalledWith(anchorId, "new-jwt");
  });
});
