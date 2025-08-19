import { ethers } from 'ethers';
import { tokenAbi } from '../app/abis/YAPToken';

export async function handleSpanishTeacherAccessFromPage({
  userId,
  showSnackbar,
  signer,
  BACKEND_WALLET_ADDRESS,
  TOKEN_ADDRESS,
  API_URL,
  router,
  setCheckingAccess,
  setIsVerifyingPermit,
  removeSnackbar,
  // NEW (optional): pass a function that clears every snackbar
  clearAllSnackbars,
  signTypedData,
}: {
  userId: string;
  showSnackbar: (opts: any) => void;
  signer: ethers.Signer;
  BACKEND_WALLET_ADDRESS: string;
  TOKEN_ADDRESS: string;
  API_URL: string;
  router: any;
  setCheckingAccess: (v: boolean) => void;
  setIsVerifyingPermit: (v: boolean) => void;
  removeSnackbar: (id: number) => void;
  clearAllSnackbars?: () => void; // <-- add this to your snackbar hook if you can
  signTypedData: (
    data: { domain: any; types: any; message: any; primaryType: string },
    opts: { address: string; uiOptions?: { showWalletUIs?: boolean } },
  ) => Promise<{ signature: string }>;
}) {
  setCheckingAccess(true);

  const snackId = Date.now();
  try {
    const walletAddress = await signer.getAddress();

    const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
    const oneYap = ethers.parseUnits('1', 18);
    const nonce = await token.nonces(walletAddress);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const domain = {
      name: 'YapTokenTestV4',
      version: '1',
      chainId: 1328,
      verifyingContract: TOKEN_ADDRESS,
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const message = {
      owner: walletAddress,
      spender: BACKEND_WALLET_ADDRESS,
      value: oneYap.toString(),
      nonce: nonce.toString(),
      deadline,
    };

    const { signature } = await signTypedData(
      { domain, types, message, primaryType: 'Permit' },
      { address: walletAddress, uiOptions: { showWalletUIs: false } },
    );

    setIsVerifyingPermit(true);
    showSnackbar({
      id: snackId,
      message: 'Verifying transaction on-chain…',
      variant: 'completion',
      manual: true,
    });

    const res = await fetch(`${API_URL}/api/request-spanish-teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        walletAddress,
        permit: { ...message, signature },
      }),
    });

    // Always remove the verifying snackbar
    removeSnackbar(snackId);

    if (!res.ok) {
      showSnackbar({ message: 'Verification failed.', variant: 'error' });
      return;
    }

    // 🔐 Clear EVERYTHING before showing success (so only one toast remains)
    if (clearAllSnackbars) clearAllSnackbars();

    showSnackbar({
      message: 'Access granted!',
      variant: 'success',
      duration: 3000,
    });
  } catch (err) {
    console.error('Permit error:', err);
    removeSnackbar(snackId);
    showSnackbar({ message: 'Failed to authorize payment.', variant: 'error' });
  } finally {
    setCheckingAccess(false);
    setIsVerifyingPermit(false);
  }
}
