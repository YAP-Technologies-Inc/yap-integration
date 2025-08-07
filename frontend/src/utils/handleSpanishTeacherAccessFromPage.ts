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
  signTypedData,
}) {
  setCheckingAccess(true);

  try {
    const walletAddress = await signer.getAddress();

    const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
    const oneYap = ethers.parseUnits('1', 18);
    const nonce = await token.nonces(walletAddress);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const domain = {
      name: 'YapTokenTestV2',
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
      {
        domain,
        types,
        message,
        primaryType: 'Permit',
      },
      {
        address: walletAddress,
        uiOptions: { showWalletUIs: false },
      }
    );

    setIsVerifyingPermit(true);
    const snackId = Date.now();
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

    removeSnackbar(snackId);
    setIsVerifyingPermit(false);

    if (!res.ok) {
      showSnackbar({ message: 'Verification failed.', variant: 'error' });
      return;
    }

    showSnackbar({
      message: 'Access granted!',
      variant: 'success',
      duration: 3000,
    });
  } catch (err) {
    console.error('Permit error:', err);
    showSnackbar({
      message: 'Failed to authorize payment.',
      variant: 'error',
    });
  } finally {
    setCheckingAccess(false);
    setIsVerifyingPermit(false);
  }
}
