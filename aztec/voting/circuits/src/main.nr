use dep::std;

fn main(root : pub Field, index : Field, hash_path : [Field; 2], secret: [Field; 2], proposalId: pub Field, vote: pub Field) -> pub Field {
    let note_commitment = std::hash::pedersen_hash(secret);
    let nullifier = std::hash::pedersen_hash([root, secret[0], secret[1], proposalId]);

    let check_root = std::merkle::compute_merkle_root(note_commitment, index, hash_path);
    assert(root == check_root);

     // Originally contrained the vote to avoid front-running,
     // but including the vote as a public input is sufficient

     // assert(vote <= 1);

    nullifier
}

#[test]
fn test_valid_build_merkle_tree() {
    let commitment_0 =  std::hash::pedersen_hash([1, 10]);
    let commitment_1 =  std::hash::pedersen_hash([2, 10]);
    let commitment_2 =  std::hash::pedersen_hash([3, 10]);
    let commitment_3 =  std::hash::pedersen_hash([4, 10]);

    let left_branch = std::hash::pedersen_hash([commitment_0, commitment_1]);
    let right_branch = std::hash::pedersen_hash([commitment_2, commitment_3]);

    let root = std::hash::pedersen_hash([left_branch, right_branch]);

    let proposalId = 0;
    let vote = 1;

    let nullifier = main(
        root,
        0,
        [commitment_1, right_branch],
        [1,10],
        proposalId,
        vote
    );

    let expected_nullifier = std::hash::pedersen_hash([root, 1, 10, proposalId]);

    std::println("Merkle Tree:");
    std::println([root]);
    std::println([left_branch, right_branch]);
    std::println([commitment_0, commitment_1, commitment_2, commitment_3]);
    std::println([nullifier]);

    assert(nullifier == expected_nullifier);
}