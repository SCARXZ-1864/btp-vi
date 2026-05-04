import os
import tempfile


_orig_mkdtemp = tempfile.mkdtemp


def _writable_mkdtemp(suffix=None, prefix=None, dir=None):
    suffix = "" if suffix is None else suffix
    prefix = tempfile.gettempprefix() if prefix is None else prefix
    base_dir = tempfile.gettempdir() if dir is None else dir
    for _ in range(tempfile.TMP_MAX):
        name = next(tempfile._get_candidate_names())
        path = os.path.abspath(os.path.join(base_dir, prefix + name + suffix))
        try:
            os.makedirs(path, exist_ok=False)
            return path
        except FileExistsError:
            continue
    return _orig_mkdtemp(suffix=suffix, prefix=prefix, dir=dir)


tempfile.mkdtemp = _writable_mkdtemp
