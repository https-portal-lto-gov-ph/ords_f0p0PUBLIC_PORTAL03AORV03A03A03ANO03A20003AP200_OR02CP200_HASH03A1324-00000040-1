/**
 *
 * Copyright: DERMALOG Identification Systems GmbH, Hamburg - Germany, 2013-2020.
 *
 * WWirns   06.01.2020  Initial version
 * WWirns   01.08.2022  Add version object to namespace
 * WWirns   11.01.2023  Extend version object of namespace
 **/

"use strict";

dermalog.dl_common = {};
dermalog.dl_common.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }
    , major: 1, minor: 0, patch: 4
};
