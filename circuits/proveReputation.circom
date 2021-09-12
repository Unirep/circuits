include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "./hasherPoseidon.circom";
include "./identityCommitment.circom";
include "./incrementalMerkleTree.circom";
include "./modulo.circom";
include "./sparseMerkleTree.circom";
include "./userExists.circom";

template ProveReputation(GST_tree_depth, user_state_tree_depth, EPOCH_KEY_NONCE_PER_EPOCH, MAX_REPUTATION_SCORE_BITS) {
    signal input epoch;
    signal private input nonce;

    // Global state tree leaf: Identity & user state root
    signal private input identity_pk[2];
    signal private input identity_nullifier;
    signal private input identity_trapdoor;
    signal private input user_tree_root;
    // Global state tree
    signal private input GST_path_index[GST_tree_depth];
    signal private input GST_path_elements[GST_tree_depth][1];
    signal input GST_root;
    // Attester to prove reputation from
    signal input attester_id;
    // Attestation by the attester
    signal private input pos_rep;
    signal private input neg_rep;
    signal private input graffiti;
    signal private input UST_path_elements[user_state_tree_depth][1];
    // Adding flexibility to prove mp, mn or graffiti
    signal input prove_pos_rep;
    signal input prove_neg_rep;
    signal input prove_rep_diff;
    signal input prove_graffiti;
    // Adding flexibility to prove differece of reputations
    signal input min_rep_diff;
    // Condition on repuations to prove
    signal input min_pos_rep;
    signal input max_neg_rep;
    // Graffiti
    signal input graffiti_pre_image;


    /* 1. Check nonce validity */
    var bitsPerNonce = 8;

    component nonce_lt = LessThan(bitsPerNonce);
    nonce_lt.in[0] <== nonce;
    nonce_lt.in[1] <== EPOCH_KEY_NONCE_PER_EPOCH;
    nonce_lt.out === 1;
    /* End of check 1 */

    /* 2. Check if user exists in the Global State Tree */
    component user_exist = UserExists(GST_tree_depth);
    for (var i = 0; i< GST_tree_depth; i++) {
        user_exist.GST_path_index[i] <== GST_path_index[i];
        user_exist.GST_path_elements[i][0] <== GST_path_elements[i][0];
    }
    user_exist.GST_root <== GST_root;
    user_exist.identity_pk[0] <== identity_pk[0];
    user_exist.identity_pk[1] <== identity_pk[1];
    user_exist.identity_nullifier <== identity_nullifier;
    user_exist.identity_trapdoor <== identity_trapdoor;
    user_exist.user_tree_root <== user_tree_root;
    /* End of check 2 */


    /* 3. Check if the reputation given by the attester is in the user state tree */
    component reputation_hasher = Hasher5();
    reputation_hasher.in[0] <== pos_rep;
    reputation_hasher.in[1] <== neg_rep;
    reputation_hasher.in[2] <== graffiti;
    reputation_hasher.in[3] <== 0;
    reputation_hasher.in[4] <== 0;

    component reputation_membership_check = SMTLeafExists(user_state_tree_depth);
    reputation_membership_check.leaf_index <== attester_id;
    reputation_membership_check.leaf <== reputation_hasher.hash;
    for (var i = 0; i < user_state_tree_depth; i++) {
        reputation_membership_check.path_elements[i][0] <== UST_path_elements[i][0];
    }
    reputation_membership_check.root <== user_tree_root;
    /* End of check 3 */

    /* 4. Check conditions on reputations */
    // if prove_pos_rep == TRUE then check GT
    // else return TRUE
    component if_check_pos_rep = Mux1();
    component pos_rep_get = GreaterEqThan(MAX_REPUTATION_SCORE_BITS);
    pos_rep_get.in[0] <== pos_rep;
    pos_rep_get.in[1] <== min_pos_rep;
    if_check_pos_rep.c[0] <== 1;
    if_check_pos_rep.c[1] <== pos_rep_get.out;
    if_check_pos_rep.s <== prove_pos_rep;
    if_check_pos_rep.out === 1;

    component if_check_neg_rep = Mux1();
    component neg_rep_let = LessEqThan(MAX_REPUTATION_SCORE_BITS);
    neg_rep_let.in[0] <== neg_rep;
    neg_rep_let.in[1] <== max_neg_rep;
    if_check_neg_rep.c[0] <== 1;
    if_check_neg_rep.c[1] <== neg_rep_let.out;
    if_check_neg_rep.s <== prove_neg_rep;
    if_check_neg_rep.out === 1;

    // only valid if pos_rep >= neg_rep
    component if_check_pos_get = Mux1();
    component if_check_diff_gt = Mux1();
    component rep_diff_get_zero = GreaterEqThan(MAX_REPUTATION_SCORE_BITS);
    rep_diff_get_zero.in[0] <== pos_rep;
    rep_diff_get_zero.in[1] <== neg_rep;
    if_check_pos_get.c[0] <== 1;
    if_check_pos_get.c[1] <== rep_diff_get_zero.out;
    if_check_pos_get.s <== prove_rep_diff;
    if_check_pos_get.out === 1;
    // // check if (pos_rep - neg_rep) >= min_rep_diff
    component rep_diff_get = GreaterEqThan(MAX_REPUTATION_SCORE_BITS);
    rep_diff_get.in[0] <== pos_rep - neg_rep;
    rep_diff_get.in[1] <== min_rep_diff;
    if_check_diff_gt.c[0] <== 1;
    if_check_diff_gt.c[1] <== rep_diff_get.out;
    if_check_diff_gt.s <== prove_rep_diff;
    if_check_diff_gt.out === 1;
    /* End of check 4 */

    /* 5. Check pre-image of graffiti */
    component if_check_graffiti = Mux1();
    component graffiti_hasher = HashLeftRight();
    graffiti_hasher.left <== graffiti_pre_image;
    graffiti_hasher.right <== 0;
    component graffiti_eq = IsEqual();
    graffiti_eq.in[0] <== graffiti_hasher.hash;
    graffiti_eq.in[1] <== graffiti;
    if_check_graffiti.c[0] <== 1;
    if_check_graffiti.c[1] <== graffiti_eq.out;
    if_check_graffiti.s <== prove_graffiti;
    if_check_graffiti.out === 1;
    /* End of check 5 */
 }